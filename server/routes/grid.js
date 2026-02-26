// server/routes/grid.js
const router = require('express').Router();
const { PowerReading, DailySummary } = require('../models');

// GET /api/grid/overview — current + today summary
router.get('/overview', async (req, res) => {
  try {
    const latest = await PowerReading.findOne().sort({ timestamp: -1 });
    const today  = new Date().toISOString().slice(0,10);
    const summary = await DailySummary.findOne({ date: today });

    res.json({
      currentPower:    latest?.powerKW ?? 0,
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

module.exports = router;
