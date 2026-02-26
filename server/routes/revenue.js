// server/routes/revenue.js
const router = require('express').Router();
const { RevenueSession } = require('../models');

// GET /api/revenue?page=1&limit=10
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const [sessions, total] = await Promise.all([
      RevenueSession.find().sort({ sessionStart: -1 }).skip(skip).limit(Number(limit)),
      RevenueSession.countDocuments(),
    ]);
    res.json({ sessions, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/revenue/summary — monthly totals
router.get('/summary', async (req, res) => {
  try {
    const summary = await RevenueSession.aggregate([
      { $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$sessionStart' } },
          totalRevenue: { $sum: '$totalRevenue' },
          totalEnergy:  { $sum: '$energyExported' },
          sessions:     { $count: {} },
      }},
      { $sort: { _id: 1 } },
    ]);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/revenue — create new sale session
router.post('/', async (req, res) => {
  try {
    const session = await RevenueSession.create(req.body);
    res.status(201).json(session);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
