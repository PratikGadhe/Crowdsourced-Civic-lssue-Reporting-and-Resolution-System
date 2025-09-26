const express = require('express');
const { 
  createFeedback, 
  getFeedbackByReport, 
  getAllFeedback
} = require('../controllers/feedbackController');

const router = express.Router();

// Create new feedback
router.post('/', createFeedback);

// Get all feedback
router.get('/', getAllFeedback);

// Get feedback by report
router.get('/report/:reportId', getFeedbackByReport);

module.exports = router;