const Building = require('../models/Building');
const EnergyReading = require('../models/EnergyReading');

// @desc    Get all buildings
// @route   GET /api/buildings
exports.getAllBuildings = async (req, res, next) => {
  try {
    const query = req.query.type ? { type: req.query.type } : {};
    const buildings = await Building.find(query);
    
    res.status(200).json({
      status: 'success',
      results: buildings.length,
      data: buildings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single building details
// @route   GET /api/buildings/:id
exports.getBuildingById = async (req, res, next) => {
  try {
    const building = await Building.findOne({ buildingId: req.params.id });
    
    if (!building) {
      return res.status(404).json({ status: 'error', message: 'Building not found' });
    }
    
    res.status(200).json({
      status: 'success',
      data: building
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get aggregated stats for a building
// @route   GET /api/buildings/:id/stats
exports.getBuildingStats = async (req, res, next) => {
  try {
    const buildingId = req.params.id;
    
    // Get the latest reading to act as "current" status
    const latestReading = await EnergyReading.findOne({ buildingId }).sort({ timestamp: -1 });
    
    // Get highest peak from the whole dataset for this building
    const peakReading = await EnergyReading.findOne({ buildingId }).sort({ energyConsumptionKwh: -1 });

    res.status(200).json({
      status: 'success',
      data: {
        buildingId,
        currentConsumptionKwh: latestReading ? latestReading.energyConsumptionKwh : 0,
        peakConsumptionKwh: peakReading ? peakReading.energyConsumptionKwh : 0,
        lastUpdated: latestReading ? latestReading.timestamp : null
      }
    });
  } catch (error) {
    next(error);
  }
};
