const express = require('express');
const { 
  createTask, 
  getTasksByEngineer, 
  updateTaskStatus,
  getAllTasks
} = require('../controllers/taskController');

const router = express.Router();

// Create new task
router.post('/', createTask);

// Get all tasks
router.get('/', getAllTasks);

// Get tasks by engineer
router.get('/engineer/:engineerId', getTasksByEngineer);

// Update task status
router.put('/:id/status', updateTaskStatus);

module.exports = router;