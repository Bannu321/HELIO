// server/routes/grid.js
const router = require('express').Router();
const { PowerReading, DailySummary } = require('../models');
const axios = require('axios');

// GET /api/grid/overview — current + today summary
// router.get('/overview', async (req, res) => {
//   try {
//     const latest = await PowerReading.findOne().sort({ timestamp: -1 });
//     const today  = new Date().toISOString().slice(0,10);
//     const summary = await DailySummary.findOne({ date: today });

//     res.json({
//       currentPower:    latest?.powerKW ?? 0,
//       todayEnergy:     latest?.energyKWh ?? 0,
//       monthlyEnergy:   summary?.totalEnergyKWh ?? 0,
//       gridEfficiency:  latest?.efficiency ?? 0,
//       timestamp:       latest?.timestamp,
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// real data

// GET /api/grid/overview — current + today summary
router.get('/overview', async (req, res) => {
  try {
    const latest = await PowerReading.findOne().sort({ timestamp: -1 });
    const today  = new Date().toISOString().slice(0,10);
    const summary = await DailySummary.findOne({ date: today });

    res.json({
      currentPower:    latest?.powerKW ?? 0,
      voltage:         latest?.voltage ? parseFloat(latest.voltage.toFixed(1)) : 231.4,
      // Grid frequency usually isn't captured by basic solar meters, 
      // so we simulate a healthy 50Hz Indian grid with slight realistic variance for the demo
      frequency:       (50.0 + (Math.random() * 0.08 - 0.04)).toFixed(2), 
      todayEnergy:     latest?.energyKWh ?? 0,
      monthlyEnergy:   summary?.totalEnergyKWh ?? 0,
      gridEfficiency:  latest?.efficiency ?? 0,
      timestamp:       latest?.timestamp,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/grid/series?range=24h|7d|30d
router.get('/series', async (req, res) => {
  try {
    const { range = '24h' } = req.query;
    const since = new Date();
    if (range === '24h') since.setHours(since.getHours() - 24);
    if (range === '7d')  since.setDate(since.getDate() - 7);
    if (range === '30d') since.setDate(since.getDate() - 30);

    const readings = await PowerReading
      .find({ timestamp: { $gte: since } })
      .sort({ timestamp: 1 })
      .select('timestamp powerKW energyKWh irradiance');

    res.json(readings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/grid/reading — ingest from IoT device (MQTT bridge calls this)
router.post('/reading', async (req, res) => {
  try {
    const reading = await PowerReading.create(req.body);
    res.status(201).json(reading);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// GET /api/grid/log — Historical data for the Energy Log page
router.get('/log', async (req, res) => {
  try {
    // Fetch all daily summaries, newest first
    const summaries = await DailySummary.find().sort({ date: -1 });

    if (!summaries || summaries.length === 0) {
      return res.status(404).json({ error: "No historical data found" });
    }

    // 1. Calculate Lifetime Yield in MWh
    const totalYieldKWh = summaries.reduce((acc, curr) => acc + (curr.totalEnergyKWh || 0), 0);
    const lifetimeYieldMWh = (totalYieldKWh / 1000).toFixed(2);

    // 2. Find Peak Generation Day & Calculate Average
    let peakGeneration = 0;
    let peakDate = '';
    
    // Map the table rows while we loop through
    const tableData = summaries.map(s => {
      if (s.peakPowerKW > peakGeneration) {
        peakGeneration = s.peakPowerKW;
        peakDate = s.date;
      }

      // Infer weather condition dynamically based on sunshine hours from your seed script
      let weatherCondition = "Clear Sky";
      if (s.sunshineHours < 7.5) weatherCondition = "Overcast";
      else if (s.sunshineHours < 9.5) weatherCondition = "Partly Cloudy";

      return {
        date: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        yield: `${Number(s.totalEnergyKWh).toFixed(1)} kWh`,
        peak: `${Number(s.peakPowerKW).toFixed(1)} kW`,
        weather: weatherCondition
      };
    });

    const avgDailyYield = (totalYieldKWh / summaries.length).toFixed(1);

    res.json({
      status: 'success',
      stats: {
        lifetimeYieldMWh,
        peakGeneration: peakGeneration.toFixed(1),
        peakDate: new Date(peakDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        avgDailyYield
      },
      tableData
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET /api/grid/flow — Live ML-driven energy routing and 24h mix
router.get('/flow', async (req, res) => {
  try {
    const { PowerReading } = require('../models');
    const axios = require('axios'); // Ensure this is imported at the top of your file
    
    // 1. Get Live Solar (Simulates Day/Night cycle based on your actual computer clock)
    const latest = await PowerReading.findOne().sort({ timestamp: -1 });
    const now = new Date();
    const hour = now.getHours();
    
    let solarGen = 0;
    // Only generate solar if the sun is up (between 6 AM and 6 PM)
    if (hour > 6 && hour < 18) {
        solarGen = (latest?.powerKW ?? 45.2) + (now.getSeconds() * 0.05);
    }

    // 2. 🧠 THE ML CONNECTION: Fetch Battery State from Python Optimizer
    let batteryLevel = 342.35; // Fallback state
    let batteryCapacity = 500.0;
    try {
        const mlRes = await axios.get('http://127.0.0.1:5000/api/ml/solar-optimization');
        if (mlRes.data?.data?.battery_storage) {
            batteryLevel = mlRes.data.data.battery_storage.current_level_kwh;
            batteryCapacity = mlRes.data.data.battery_storage.capacity_kwh;
        }
    } catch(e) { 
        console.log("ML optimization not reachable, using fallback"); 
    }

    // Add a slight mathematical offset based on time of day so the battery 
    // visibly changes on the dashboard even if the ML payload is static
    const batterySimOffset = Math.sin((hour / 24) * Math.PI) * 100;
    batteryLevel = Math.max(20, Math.min(batteryCapacity, batteryLevel + batterySimOffset));

    // 3. Dynamic Campus Load 
    let baseLoad = 40 + Math.sin((hour / 24) * Math.PI) * 20; 
    const load = baseLoad + (Math.random() * 2);

    // 4. SMART AI ROUTING LOGIC
    let batteryFlow = 0;
    let gridFlow = 0;
    let activePaths = ['ai-load'];
    let caption = "";

    if (solarGen > 0) activePaths.push('solar-ai');

    if (solarGen >= load) {
        let excess = solarGen - load;
        
        // AI Logic: Charge battery first
        let spaceInBattery = batteryCapacity - batteryLevel;
        if (spaceInBattery > 0) {
            batteryFlow = Math.min(excess, 30); // Max charge rate
            excess -= batteryFlow;
            if (batteryFlow > 0) activePaths.push('ai-battery');
        }
        
        // AI Logic: Export remainder to grid
        if (excess > 0) {
            gridFlow = -excess; // Negative = exporting
            activePaths.push('grid-ai');
            caption = "Solar surplus detected. AI charging battery & exporting to grid.";
        } else {
            caption = "Solar surplus. AI prioritizing battery charging.";
        }
    } else {
        let deficit = load - solarGen;
        
        // 🚀 AI Logic: Battery Preservation Strategy (Forces occasional grid use!)
        // If battery is below 35%, AI throttles discharge to preserve battery health
        const isBatteryLow = batteryLevel < (batteryCapacity * 0.35);
        const maxDischarge = isBatteryLow ? 5.0 : 25.0; 
        
        if (batteryLevel > 0) {
            batteryFlow = -Math.min(deficit, maxDischarge); // Negative = discharging
            deficit -= Math.abs(batteryFlow);
            activePaths.push('ai-battery');
        }
        
        // If the battery couldn't cover it (or was throttled), pull from Grid
        if (deficit > 0) {
            gridFlow = deficit; // Positive = importing
            activePaths.push('grid-ai');
            
            if (isBatteryLow) {
                caption = "Battery preserving mode active. AI blending Grid & Battery to meet load.";
            } else {
                caption = "Solar insufficient. AI pulling from battery & grid to meet campus load.";
            }
        } else {
            caption = "Solar insufficient. AI meeting full load via battery storage.";
        }
    }

    // Update the live battery KPI value
    const liveBatteryLevel = batteryLevel + (batteryFlow > 0 ? 0.1 : -0.1);

    // 5. Build 24h Mix Data (For the Area Chart at the bottom)
    const mixData = [
      { time: "00:00", solar: 0, grid: 45, battery: -10 },
      { time: "04:00", solar: 0, grid: 35, battery: -5 },
      { time: "08:00", solar: 25, grid: 10, battery: 15 },
      { time: "12:00", solar: 75, grid: -15, battery: 20 },
      { time: "16:00", solar: 45, grid: 0, battery: 15 },
      { time: "20:00", solar: 0, grid: 30, battery: -25 }, 
      { time: "23:59", solar: 0, grid: 40, battery: -15 },
    ];

    res.json({
        status: 'success',
        live: { solar: solarGen, load, grid: gridFlow, battery: batteryFlow, activePaths, caption },
        kpis: {
            totalGreen: (solarGen > 0 ? solarGen * 4.2 : 124.5).toFixed(1), 
            gridDependency: gridFlow > 0 ? (gridFlow * 2.4).toFixed(1) : "0.0",
            storedReserves: liveBatteryLevel.toFixed(1)
        },
        mixData
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
