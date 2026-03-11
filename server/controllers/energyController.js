const EnergyReading = require('../models/EnergyReading');

// @desc    Get current energy for all buildings (latest timestamp)
// @route   GET /api/energy/current
exports.getCurrentEnergyAll = async (req, res, next) => {
  try {
    // In a real app, we'd query by the exact current time. 
    // For this dummy data, we'll grab the most recent timestamp in the DB
    const latestRecord = await EnergyReading.findOne().sort({ timestamp: -1 });
    
    if (!latestRecord) {
      return res.status(404).json({ status: 'error', message: 'No energy data found' });
    }

    const currentData = await EnergyReading.find({ timestamp: latestRecord.timestamp });

    res.status(200).json({
      status: 'success',
      timestamp: latestRecord.timestamp,
      results: currentData.length,
      data: currentData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get historical data for a specific building
// @route   GET /api/energy/historical/:buildingId
exports.getHistoricalEnergy = async (req, res, next) => {
  try {
    const { buildingId } = req.params;
    const { start_date, end_date } = req.query;

    let query = { buildingId };

    // Filter by date range if provided
    if (start_date || end_date) {
      query.timestamp = {};
      if (start_date) query.timestamp.$gte = new Date(start_date);
      if (end_date) query.timestamp.$lte = new Date(end_date);
    }

    // Sort chronologically
    const readings = await EnergyReading.find(query)
        .sort({ timestamp: 1 })
        .limit(1000); // Limit to prevent crashing the frontend with 6 months of 15-min data at once

    res.status(200).json({
      status: 'success',
      results: readings.length,
      data: readings
    });
  } catch (error) {
    next(error);
  }
};