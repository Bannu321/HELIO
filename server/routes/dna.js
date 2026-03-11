// server/routes/dna.js
const router = require('express').Router();

// GET /api/dna/profiles
// Returns the Campus Blueprint (Average Load) and 24h Time-Series DNA
router.get('/profiles', async (req, res) => {
  try {
    // In a future production build, this would aggregate consumption 
    // data from a "ConsumptionMeter" MongoDB collection. 
    // For now, we serve the dynamic algorithmic data for the React charts.

    const blueprintData = [
      { name: 'Hostels', value: 3200, color: '#FF4C6A' },
      { name: 'Central Block', value: 2400, color: '#00E5FF' },
      { name: 'AB1', value: 1850, color: '#f59e0b' },
      { name: 'AB2', value: 1600, color: '#fcd34d' },
      { name: 'Library', value: 950, color: '#00E5A0' },
    ];

    const timeSeriesDNA = [
      { time: '00:00', Library: 15, AB1: 20, CB: 40, AB2: 15, Hostels: 180 },
      { time: '04:00', Library: 10, AB1: 15, CB: 30, AB2: 10, Hostels: 120 },
      { time: '08:00', Library: 40, AB1: 150, CB: 200, AB2: 140, Hostels: 250 },
      { time: '12:00', Library: 120, AB1: 320, CB: 450, AB2: 300, Hostels: 90 },
      { time: '16:00', Library: 150, AB1: 280, CB: 380, AB2: 250, Hostels: 110 },
      { time: '20:00', Library: 180, AB1: 60, CB: 120, AB2: 50, Hostels: 350 },
      { time: '23:59', Library: 30, AB1: 25, CB: 50, AB2: 20, Hostels: 220 },
    ];

    res.json({
      status: 'success',
      data: {
        blueprint: blueprintData,
        timeSeries: timeSeriesDNA
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;