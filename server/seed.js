// server/seed.js — Generate realistic solar data for MongoDB
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { PowerReading, Panel, Weather, RevenueSession, DailySummary } = require('./models');

dotenv.config();

// ——— Realistic Solar Generation Curve ———
// Solar output follows a bell curve: max at solar noon (12-14h), minimal at dawn/dusk
const getSolarOutputForHour = (hour) => {
  // Peak at 13:00 (78°C typical panel temp), minimal outside 6-18h
  if (hour < 6 || hour > 18) return 0;
  // Bell curve: -0.19 * (h - 13)^2 + 50 gives peak ~50kW at noon
  return Math.max(0, -0.19 * (hour - 13) ** 2 + 50);
};

// ——— Cloud cover variation (morning clear, afternoon clouds) ———
const getCloudCoverForHour = (hour) => {
  if (hour < 6 || hour > 18) return 100;
  // More clouds in afternoon (typical for Hyderabad monsoon season)
  return Math.max(0, Math.min(100, 20 + Math.sin(hour / 4) * 30 + Math.random() * 15));
};

// ——— Temperature variation (cooler morning, hotter afternoon) ———
const getTemperatureForHour = (hour) => {
  if (hour < 6 || hour > 18) return 18;
  // 18°C at 6am, peak ~42°C at 14:00
  return 18 + Math.sin((hour - 6) / 12 * Math.PI) * 24;
};

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/helio_solar', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      PowerReading.deleteMany({}),
      Panel.deleteMany({}),
      Weather.deleteMany({}),
      RevenueSession.deleteMany({}),
      DailySummary.deleteMany({}),
    ]);

    // ——— STEP 1: Create 24 Panels (6 panels × 4 blocks) ———
    console.log('📊 Creating panels...');
    const panelIds = [];
    const blocks = ['BLOCK-A', 'BLOCK-B', 'BLOCK-C', 'BLOCK-D'];
    const panels = [];

    for (let block = 0; block < 4; block++) {
      for (let panel = 1; panel <= 6; panel++) {
        const panelId = `${blocks[block]}-P${String(panel).padStart(2, '0')}`;
        panelIds.push(panelId);
        panels.push({
          panelId,
          block: blocks[block],
          powerW: 375, // Standard 375W panel
          efficiency: 19.5 + Math.random() * 2, // 19.5-21.5%
          tempC: 25,
          status: Math.random() > 0.95 ? 'fault' : 'active', // 5% fault rate
          lastSeen: new Date(),
        });
      }
    }
    await Panel.insertMany(panels);
    console.log(`✅ Created ${panelIds.length} panels`);

    // ——— STEP 2: Generate Power Readings (15-min intervals for last 7 days) ———
    console.log('⚡ Generating power readings...');
    const readings = [];
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    for (let d = 0; d < 7; d++) {
      const dayDate = new Date(sevenDaysAgo);
      dayDate.setDate(dayDate.getDate() + d);
      let cumulativeEnergy = 0;

      // Generate readings every 15 minutes
      for (let hour = 6; hour <= 18; hour++) {
        for (let min = 0; min < 60; min += 15) {
          const timestamp = new Date(dayDate);
          timestamp.setHours(hour, min, 0, 0);

          // Add realistic variation
          const baseOutput = getSolarOutputForHour(hour);
          const cloudImpact = (100 - getCloudCoverForHour(hour)) / 100;
          const randomVariation = (Math.random() - 0.5) * 3; // ±1.5kW variation
          
          const powerKW = Math.max(0, baseOutput * cloudImpact + randomVariation);
          cumulativeEnergy += powerKW * 0.25; // 15 min = 0.25 hour

          // Cycle through blocks for distribution
          const blockIndex = Math.floor((timestamp.getTime() / 1000) % 4);
          const irradiance = Math.max(0, 1000 * cloudImpact - Math.random() * 50);

          readings.push({
            timestamp,
            powerKW: parseFloat(powerKW.toFixed(2)),
            energyKWh: parseFloat(cumulativeEnergy.toFixed(2)),
            voltage: 380 + Math.random() * 20,
            current: powerKW / 0.38, // Rough estimate
            panelBlock: blocks[blockIndex],
            irradiance: parseFloat(irradiance.toFixed(0)),
            efficiency: 18 + Math.random() * 3,
          });
        }
      }
    }
    await PowerReading.insertMany(readings);
    console.log(`✅ Created ${readings.length} power readings\ `);

    // ——— STEP 3: Generate Weather Data ———
    console.log('🌤️  Generating weather data...');
    const weatherReadings = [];
    const weatherConditions = [
      { label: 'Clear', icon: '☀️', cloudCover: 5, irradiance: 950 },
      { label: 'Partly Cloudy', icon: '⛅', cloudCover: 30, irradiance: 800 },
      { label: 'Cloudy', icon: '☁️', cloudCover: 60, irradiance: 500 },
      { label: 'Overcast', icon: '🌥️', cloudCover: 85, irradiance: 200 },
    ];

    for (let d = 0; d < 7; d++) {
      const dayDate = new Date(sevenDaysAgo);
      dayDate.setDate(dayDate.getDate() + d);

      // 4 readings per day (6h, 12h, 15h, 18h)
      for (const hour of [6, 12, 15, 18]) {
        const timestamp = new Date(dayDate);
        timestamp.setHours(hour, 0, 0, 0);
        
        const condition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
        const temp = getTemperatureForHour(hour);

        weatherReadings.push({
          timestamp,
          temp: Math.round(temp),
          feelsLike: Math.round(temp + 2),
          humidity: 40 + Math.random() * 40,
          windSpeed: 5 + Math.random() * 15,
          uvIndex: Math.max(0, 4 + Math.sin((hour - 6) / 12 * Math.PI) * 5),
          cloudCover: condition.cloudCover + Math.random() * 10,
          irradiance: condition.irradiance * (1 - Math.random() * 0.2),
          condition: condition.label,
          icon: condition.icon,
          source: 'Mock Data',
        });
      }
    }
    await Weather.insertMany(weatherReadings);
    console.log(`Created ${weatherReadings.length} weather readings`);

    // ——— STEP 4: Generate Revenue Sessions ———
    console.log('💰 Generating revenue sessions...');
    const sessions = [];
    let sessionId = 1001;

    for (let d = 0; d < 7; d++) {
      const dayDate = new Date(sevenDaysAgo);
      dayDate.setDate(dayDate.getDate() + d);

      // Morning session (6-10h)
      const morningEnergy = 165; // kWh
      const morningRate = 3.20; // ₹/kWh (morning export)
      sessions.push({
        sessionStart: new Date(dayDate.setHours(6, 0, 0, 0)),
        sessionEnd: new Date(dayDate.setHours(10, 0, 0, 0)),
        energyExported: morningEnergy,
        ratePerKWh: morningRate,
        totalRevenue: morningEnergy * morningRate,
        panelBlock: 'BLOCK-A',
        status: Math.random() > 0.05 ? 'settled' : 'pending',
        meterReading: 10000 + sessionId,
      });

      // Afternoon session (10-14h) - Peak generation
      const afternoonEnergy = 245; // kWh
      const afternoonRate = 3.50; // ₹/kWh (peak rate)
      sessions.push({
        sessionStart: new Date(dayDate.setHours(10, 0, 0, 0)),
        sessionEnd: new Date(dayDate.setHours(14, 0, 0, 0)),
        energyExported: afternoonEnergy,
        ratePerKWh: afternoonRate,
        totalRevenue: afternoonEnergy * afternoonRate,
        panelBlock: 'BLOCK-B',
        status: 'settled',
        meterReading: 10000 + sessionId + 1,
      });

      // Evening session (14-18h)
      const eveningEnergy = 185; // kWh
      const eveningRate = 3.10; // ₹/kWh (evening off-peak)
      sessions.push({
        sessionStart: new Date(dayDate.setHours(14, 0, 0, 0)),
        sessionEnd: new Date(dayDate.setHours(18, 0, 0, 0)),
        energyExported: eveningEnergy,
        ratePerKWh: eveningRate,
        totalRevenue: eveningEnergy * eveningRate,
        panelBlock: 'BLOCK-C',
        status: Math.random() > 0.1 ? 'settled' : 'pending',
        meterReading: 10000 + sessionId + 2,
      });

      sessionId += 3;
    }
    await RevenueSession.insertMany(sessions);
    console.log(`✅ Created ${sessions.length} revenue sessions`);

    // ——— STEP 5: Generate Daily Summaries ———
    console.log('📅 Generating daily summaries...');
    const summaries = [];

    for (let d = 0; d < 7; d++) {
      const dayDate = new Date(sevenDaysAgo);
      dayDate.setDate(dayDate.getDate() + d);
      const dateStr = dayDate.toISOString().slice(0, 10);

      // Calculate based on power readings
      const dayReadings = readings.filter(r => {
        const rDate = r.timestamp.toISOString().slice(0, 10);
        return rDate === dateStr;
      });

      const totalEnergy = dayReadings.reduce((sum, r) => sum + r.energyKWh, 0);
      const peakPower = Math.max(...dayReadings.map(r => r.powerKW));
      const avgEfficiency = dayReadings.reduce((sum, r) => sum + r.efficiency, 0) / dayReadings.length;

      summaries.push({
        date: dateStr,
        totalEnergyKWh: parseFloat(totalEnergy.toFixed(2)),
        peakPowerKW: parseFloat(peakPower.toFixed(2)),
        totalRevenueINR: parseFloat((totalEnergy * 3.2).toFixed(0)), // Avg rate ₹3.2/kWh
        avgEfficiency: parseFloat(avgEfficiency.toFixed(1)),
        co2SavedKg: parseFloat((totalEnergy * 0.82).toFixed(2)), // ~0.82 kg CO2/kWh (India grid avg)
        sunshineHours: 8.5 + Math.random() * 2, // 8.5-10.5 hours
      });
    }
    await DailySummary.insertMany(summaries);
    console.log(`✅ Created ${summaries.length} daily summaries`);

    console.log('\n🎉 Database seeding complete!');
    console.log('\nData Summary:');
    console.log(`  • 24 solar panels generated`);
    console.log(`  • ${readings.length} power readings (7 days)`);
    console.log(`  • ${weatherReadings.length} weather snapshots`);
    console.log(`  • ${sessions.length} revenue sessions`);
    console.log(`  • 7 daily summaries`);
    console.log('\n💡 Next: Update your frontend API service to call the backend endpoints!');

  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seedDatabase();
