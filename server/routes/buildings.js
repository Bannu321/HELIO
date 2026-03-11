const express = require('express');
const router = express.Router();
const { 
  getAllBuildings, 
  getBuildingById, 
  getBuildingStats 
} = require('../controllers/buildingController');

router.get('/', getAllBuildings);
router.get('/:id', getBuildingById);
router.get('/:id/stats', getBuildingStats);

module.exports = router;