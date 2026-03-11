const express = require('express');
const router = express.Router();
const { 
  getCurrentEnergyAll, 
  getHistoricalEnergy 
} = require('../controllers/energyController');

router.get('/current', getCurrentEnergyAll);
router.get('/historical/:buildingId', getHistoricalEnergy);

module.exports = router;