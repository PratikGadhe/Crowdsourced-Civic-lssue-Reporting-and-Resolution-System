const express = require('express');
const { 
  createAssignment, 
  getAssignmentsByDepartment, 
  getAllAssignments,
  updateAssignmentStatus 
} = require('../controllers/assignmentController');

const router = express.Router();

// Create new assignment
router.post('/', createAssignment);

// Get all assignments
router.get('/', getAllAssignments);

// Get assignments by department
router.get('/department/:department', getAssignmentsByDepartment);

// Update assignment status
router.put('/:id/status', updateAssignmentStatus);

module.exports = router;