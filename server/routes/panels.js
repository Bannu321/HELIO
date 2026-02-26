// server/routes/panels.js
const router = require('express').Router();
const { Panel } = require('../models');

// GET /api/panels — all panel statuses
router.get('/', async (req, res) => {
  try {
    const panels = await Panel.find().sort({ panelId: 1 });
    res.json(panels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/panels/:id — update panel reading (called by IoT gateway)
router.put('/:id', async (req, res) => {
  try {
    const panel = await Panel.findOneAndUpdate(
      { panelId: req.params.id },
      { ...req.body, lastSeen: new Date() },
      { new: true, upsert: true }
    );
    res.json(panel);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
