// server/models/index.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

// ——— Power Reading (time-series, every 15 min from inverter) ———
const PowerReadingSchema = new Schema(
  {
    timestamp: { type: Date, default: Date.now, index: true },
    powerKW: { type: Number, required: true }, // instantaneous kW
    energyKWh: { type: Number, required: true }, // cumulative today
    voltage: Number,
    current: Number,
    panelBlock: {
      type: String,
      enum: ["BLOCK-A", "BLOCK-B", "BLOCK-C", "BLOCK-D"],
    },
    irradiance: Number, // W/m²
    efficiency: Number, // %
  },
  { timestamps: true },
);

// ——— Revenue / Energy Sale Session ———
const RevenueSesionSchema = new Schema(
  {
    sessionStart: { type: Date, required: true },
    sessionEnd: Date,
    energyExported: { type: Number, required: true }, // kWh sold to grid
    ratePerKWh: { type: Number, required: true }, // ₹/kWh
    totalRevenue: { type: Number, required: true }, // ₹
    panelBlock: String,
    status: {
      type: String,
      enum: ["pending", "settled", "failed"],
      default: "pending",
    },
    meterReading: Number,
  },
  { timestamps: true },
);

// ——— Weather Snapshot ———
const WeatherSchema = new Schema(
  {
    timestamp: { type: Date, default: Date.now },
    temp: Number,
    feelsLike: Number,
    humidity: Number,
    windSpeed: Number,
    uvIndex: Number,
    cloudCover: Number,
    irradiance: Number,
    condition: String,
    icon: String,
    source: { type: String, default: "OpenWeatherMap" },
  },
  { timestamps: true },
);

// ——— Panel Status ———
const PanelSchema = new Schema(
  {
    panelId: { type: String, required: true, unique: true },
    block: String,
    powerW: Number,
    efficiency: Number,
    tempC: Number,
    status: {
      type: String,
      enum: ["active", "fault", "offline"],
      default: "active",
    },
    lastSeen: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// ——— Daily Summary (aggregated, stored once per day) ———
const DailySummarySchema = new Schema(
  {
    date: { type: String, required: true, unique: true }, // 'YYYY-MM-DD'
    totalEnergyKWh: Number,
    peakPowerKW: Number,
    totalRevenueINR: Number,
    avgEfficiency: Number,
    co2SavedKg: Number,
    sunshineHours: Number,
  },
  { timestamps: true },
);

// Export helper models from separate files as well (required by some controllers)
const Building = require("./Building");
const EnergyReading = require("./EnergyReading");
const SolarGeneration = require("./SolarGeneration");

module.exports = {
  PowerReading: mongoose.model("PowerReading", PowerReadingSchema),
  RevenueSession: mongoose.model("RevenueSession", RevenueSesionSchema),
  Weather: mongoose.model("Weather", WeatherSchema),
  Panel: mongoose.model("Panel", PanelSchema),
  DailySummary: mongoose.model("DailySummary", DailySummarySchema),
  // convenience exports for other parts of the codebase
  Building,
  EnergyReading,
  SolarGeneration,
};
