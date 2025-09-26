const Assignment = require('../models/Assignment');

// Create new assignment
const createAssignment = async (req, res) => {
  try {
    console.log('📋 Creating assignment:', req.body);
    
    const assignment = new Assignment(req.body);
    await assignment.save();
    
    console.log('✅ Assignment created:', assignment);
    
    res.status(201).json({ success: true, data: assignment });
  } catch (error) {
    console.error('❌ Error creating assignment:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get assignments for specific department
const getAssignmentsByDepartment = async (req, res) => {
  try {
    const { department } = req.params;
    console.log(`🔍 Getting assignments for department: ${department}`);
    
    const assignments = await Assignment.find({ department }).sort({ createdAt: -1 });
    
    console.log(`✅ Found ${assignments.length} assignments for ${department}`);
    
    res.json({ success: true, data: assignments });
  } catch (error) {
    console.error('❌ Error fetching assignments:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all assignments
const getAllAssignments = async (req, res) => {
  try {
    console.log('🔍 Getting all assignments');
    
    const assignments = await Assignment.find().sort({ createdAt: -1 });
    
    console.log(`✅ Found ${assignments.length} total assignments`);
    
    res.json({ success: true, data: assignments });
  } catch (error) {
    console.error('❌ Error fetching assignments:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update assignment status
const updateAssignmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    console.log(`🔄 Updating assignment ${id} status to: ${status}`);
    
    const assignment = await Assignment.findByIdAndUpdate(
      id,
      { status, lastUpdated: new Date() },
      { new: true }
    );
    
    if (!assignment) {
      return res.status(404).json({ success: false, error: 'Assignment not found' });
    }
    
    console.log('✅ Assignment status updated:', assignment);
    
    res.json({ success: true, data: assignment });
  } catch (error) {
    console.error('❌ Error updating assignment:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

module.exports = { 
  createAssignment, 
  getAssignmentsByDepartment, 
  getAllAssignments,
  updateAssignmentStatus 
};