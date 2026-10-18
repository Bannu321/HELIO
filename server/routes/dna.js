// server/routes/dna.js
const router = require('express').Router();

// GET /api/dna/profiles
// Returns the Campus Blueprint (Average Load) and 24h Time-Series DNA
router.get('/profiles', async (req, res) => {
  try {
    // In a future production build, this would aggregate consumption 
    // data from a "ConsumptionMeter" MongoDB collection. 
    // For now, we serve the dynamic algorithmic data for the React charts.

    const blueprintData = [
      { name: 'Eco Villa 101', value: 3200, color: '#f59e0b' },
      { name: 'Solar Haven 202', value: 2400, color: '#00E5FF' },
      { name: 'Green Horizon 303', value: 1850, color: '#a78bfa' },
      { name: 'Sunridge Home 404', value: 1600, color: '#00E5A0' },
    ];

    const timeSeriesDNA = [
      { time: '00:00', EcoVilla101: 180, SolarHaven202: 40, GreenHorizon303: 20, SunridgeHome404: 15 },
      { time: '04:00', EcoVilla101: 120, SolarHaven202: 30, GreenHorizon303: 15, SunridgeHome404: 10 },
      { time: '08:00', EcoVilla101: 250, SolarHaven202: 200, GreenHorizon303: 150, SunridgeHome404: 140 },
      { time: '12:00', EcoVilla101: 90, SolarHaven202: 450, GreenHorizon303: 320, SunridgeHome404: 300 },
      { time: '16:00', EcoVilla101: 110, SolarHaven202: 380, GreenHorizon303: 280, SunridgeHome404: 250 },
      { time: '20:00', EcoVilla101: 350, SolarHaven202: 120, GreenHorizon303: 60, SunridgeHome404: 50 },
      { time: '23:59', EcoVilla101: 220, SolarHaven202: 50, GreenHorizon303: 25, SunridgeHome404: 20 },
    ];

    res.json({
      status: 'success',
      data: {
        blueprint: blueprintData,
        timeSeries: timeSeriesDNA
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
