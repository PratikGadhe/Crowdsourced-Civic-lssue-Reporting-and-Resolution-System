const Task = require('../models/Task');
const Engineer = require('../models/Engineer');

// Create new task (assign to engineer)
const createTask = async (req, res) => {
  try {
    console.log('📋 Creating task:', req.body);
    
    const task = new Task(req.body);
    await task.save();
    
    // Update engineer's current tasks count
    await Engineer.findByIdAndUpdate(
      req.body.engineerId,
      { $inc: { currentTasks: 1 } }
    );
    
    console.log('✅ Task created and assigned to engineer:', task);
    
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    console.error('❌ Error creating task:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get tasks for specific engineer
const getTasksByEngineer = async (req, res) => {
  try {
    const { engineerId } = req.params;
    console.log(`🔍 Getting tasks for engineer: ${engineerId}`);
    
    const tasks = await Task.find({ engineerId }).sort({ createdAt: -1 });
    
    console.log(`✅ Found ${tasks.length} tasks for engineer`);
    
    res.json({ success: true, data: tasks });
  } catch (error) {
    console.error('❌ Error fetching tasks:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update task status
const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, completionPhotos } = req.body;
    
    console.log(`🔄 Updating task ${id} status to: ${status}`);
    
    const updateData = { status };
    
    // Add timestamp based on status
    if (status === 'accepted') updateData.acceptedAt = new Date();
    if (status === 'in-progress') updateData.startedAt = new Date();
    if (status === 'completed') updateData.completedAt = new Date();
    if (status === 'verified') updateData.verifiedAt = new Date();
    
    if (notes) updateData.notes = notes;
    if (completionPhotos) updateData.completionPhotos = completionPhotos;
    
    const task = await Task.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    
    // Update engineer's current tasks count if task is completed
    if (status === 'completed') {
      await Engineer.findByIdAndUpdate(
        task.engineerId,
        { 
          $inc: { currentTasks: -1, totalTasksCompleted: 1 }
        }
      );
    }
    
    console.log('✅ Task status updated:', task);
    
    res.json({ success: true, data: task });
  } catch (error) {
    console.error('❌ Error updating task:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get all tasks
const getAllTasks = async (req, res) => {
  try {
    console.log('🔍 Getting all tasks');
    
    const tasks = await Task.find().sort({ createdAt: -1 });
    
    console.log(`✅ Found ${tasks.length} total tasks`);
    
    res.json({ success: true, data: tasks });
  } catch (error) {
    console.error('❌ Error fetching tasks:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { 
  createTask, 
  getTasksByEngineer, 
  updateTaskStatus,
  getAllTasks
};