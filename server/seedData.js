const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables from the backend root
dotenv.config({ path: path.join(__dirname, './.env') });

// Import Models
const Building = require('./models/Building');
const EnergyReading = require('./models/EnergyReading');
const SolarGeneration = require('./models/SolarGeneration');

// Define where the Python scripts saved the data
const DATA_DIR = path.join(__dirname, './ml_engine/data');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected for Seeding'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

const BATCH_SIZE = 10000;

async function seedBuildings() {
  console.log('--- Seeding Buildings ---');
  const buildingsData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'buildings.json'), 'utf-8'));
  
  await Building.deleteMany();
  await Building.insertMany(buildingsData);
  console.log(`✅ ${buildingsData.length} Buildings inserted.`);
}

function seedCSV(filePath, Model, modelName) {
  return new Promise(async (resolve, reject) => {
    console.log(`--- Seeding ${modelName} ---`);
    await Model.deleteMany();
    
    let batch = [];
    let totalInserted = 0;

    const stream = fs.createReadStream(filePath).pipe(csv());

    stream.on('data', async (row) => {
      batch.push(row);

      if (batch.length >= BATCH_SIZE) {
        stream.pause(); // Pause reading while we insert
        try {
          await Model.insertMany(batch);
          totalInserted += batch.length;
          console.log(`Inserted ${totalInserted} ${modelName} records...`);
          batch = [];
          stream.resume(); // Resume reading
        } catch (error) {
          console.error(`Error inserting batch:`, error);
          stream.destroy();
          reject(error);
        }
      }
    });

    stream.on('end', async () => {
      // Insert any remaining records
      if (batch.length > 0) {
        try {
          await Model.insertMany(batch);
          totalInserted += batch.length;
        } catch (error) {
          console.error(`Error inserting final batch:`, error);
          reject(error);
          return;
        }
      }
      console.log(`✅ Finished seeding! Total ${modelName} inserted: ${totalInserted}`);
      resolve();
    });

    stream.on('error', (error) => {
      console.error(`Error reading CSV:`, error);
      reject(error);
    });
  });
}

async function runSeeder() {
  try {
    // 1. Seed Metadata (JSON)
    if (fs.existsSync(path.join(DATA_DIR, 'buildings.json'))) {
      await seedBuildings();
    } else {
      console.warn('⚠️ buildings.json not found. Skipping.');
    }

    // 2. Seed Energy Readings (CSV)
    const energyPath = path.join(DATA_DIR, 'energy_readings.csv');
    if (fs.existsSync(energyPath)) {
      await seedCSV(energyPath, EnergyReading, 'EnergyReadings');
    } else {
      console.warn('⚠️ energy_readings.csv not found. Skipping.');
    }

    // 3. Seed Solar Generation (CSV)
    const solarPath = path.join(DATA_DIR, 'solar_generation.csv');
    if (fs.existsSync(solarPath)) {
      await seedCSV(solarPath, SolarGeneration, 'SolarGeneration');
    } else {
      console.warn('⚠️ solar_generation.csv not found. Skipping.');
    }

    console.log('🎉 All data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

runSeeder();
