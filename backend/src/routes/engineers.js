const express = require('express');
const { 
  createEngineer, 
  getAllEngineers, 
  getEngineersByDepartment,
  updateEngineerStatus
} = require('../controllers/engineerController');

const router = express.Router();

// Create new engineer
router.post('/', createEngineer);

// Get all engineers
router.get('/', getAllEngineers);

// Get engineers by department
router.get('/department/:department', getEngineersByDepartment);

// Update engineer status
router.put('/:id/status', updateEngineerStatus);

module.exports = router;