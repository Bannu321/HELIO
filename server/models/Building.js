// server/models/Building.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const BuildingSchema = new Schema(
  {
    buildingId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["academic", "laboratory", "hostel", "library", "other"],
      default: "other",
    },
    floorArea: Number,
    maxOccupancy: Number,
    hasSolar: { type: Boolean, default: false },
    solarCapacityKw: Number,
    hvacCapacityKw: Number,
    lightingLoadKw: Number,
    location: {
      latitude: Number,
      longitude: Number,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Building", BuildingSchema);
