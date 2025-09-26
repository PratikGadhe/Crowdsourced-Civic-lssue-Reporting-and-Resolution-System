const Feedback = require('../models/Feedback');

// Create new feedback
const createFeedback = async (req, res) => {
  try {
    console.log('📝 Creating feedback:', req.body);
    
    const feedback = new Feedback(req.body);
    await feedback.save();
    
    console.log('✅ Feedback created:', feedback);
    
    res.status(201).json({ success: true, data: feedback });
  } catch (error) {
    console.error('❌ Error creating feedback:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get feedback for a specific report
const getFeedbackByReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    console.log(`🔍 Getting feedback for report: ${reportId}`);
    
    const feedback = await Feedback.find({ reportId }).sort({ createdAt: -1 });
    
    console.log(`✅ Found ${feedback.length} feedback entries`);
    
    res.json({ success: true, data: feedback });
  } catch (error) {
    console.error('❌ Error fetching feedback:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all feedback
const getAllFeedback = async (req, res) => {
  try {
    console.log('🔍 Getting all feedback');
    
    const feedback = await Feedback.find().sort({ createdAt: -1 });
    
    console.log(`✅ Found ${feedback.length} total feedback entries`);
    
    res.json({ success: true, data: feedback });
  } catch (error) {
    console.error('❌ Error fetching feedback:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { 
  createFeedback, 
  getFeedbackByReport, 
  getAllFeedback
};