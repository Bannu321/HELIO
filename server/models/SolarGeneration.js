// server/models/SolarGeneration.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const SolarGenerationSchema = new Schema(
  {
    timestamp: { type: Date, required: true, index: true },
    buildingId: { type: String, required: true, index: true },
    solarGenerationKwh: { type: Number, required: true },
    weatherCondition: String,
  },
  { timestamps: false },
);

module.exports = mongoose.model("SolarGeneration", SolarGenerationSchema);
