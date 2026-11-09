const router = require("express").Router();

const homes = [
  { id: 1, name: "Eco Villa 101", solar: 24.5, consumption: 14.2, battery: 82, battery_capacity_kwh: 13.5, panel_num: 18 },
  { id: 2, name: "Solar Haven 202", solar: 32.0, consumption: 20.5, battery: 78, battery_capacity_kwh: 15.0, panel_num: 24 },
  { id: 3, name: "Green Horizon 303", solar: 8.5, consumption: 16.0, battery: 50, battery_capacity_kwh: 10.0, panel_num: 10 },
  { id: 4, name: "Sunridge Home 404", solar: 38.0, consumption: 18.0, battery: 92, battery_capacity_kwh: 20.0, panel_num: 28 },
];

// Cloud-safe fallback telemetry for the Grid Community demo. Hardware telemetry
// can replace this endpoint later without changing the frontend contract.
router.get("/houses", (_req, res) => {
  res.json(homes);
});

module.exports = router;
