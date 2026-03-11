// server/models/EnergyReading.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const EnergyReadingSchema = new Schema(
  {
    timestamp: { type: Date, required: true, index: true },
    buildingId: { type: String, required: true, index: true },
    energyConsumptionKwh: { type: Number, required: true },
    occupancyPercent: Number,
    temperatureCelsius: Number,
  },
  { timestamps: false },
);

module.exports = mongoose.model("EnergyReading", EnergyReadingSchema);
