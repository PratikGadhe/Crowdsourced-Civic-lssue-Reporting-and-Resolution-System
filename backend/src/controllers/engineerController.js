const Engineer = require('../models/Engineer');

// Create new engineer
const createEngineer = async (req, res) => {
  try {
    console.log('👷 Creating engineer:', req.body);
    
    const engineer = new Engineer(req.body);
    await engineer.save();
    
    console.log('✅ Engineer created:', engineer);
    
    res.status(201).json({ success: true, data: engineer });
  } catch (error) {
    console.error('❌ Error creating engineer:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get all engineers
const getAllEngineers = async (req, res) => {
  try {
    console.log('🔍 Getting all engineers');
    
    const engineers = await Engineer.find().sort({ name: 1 });
    
    console.log(`✅ Found ${engineers.length} engineers`);
    
    res.json({ success: true, data: engineers });
  } catch (error) {
    console.error('❌ Error fetching engineers:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get engineers by department
const getEngineersByDepartment = async (req, res) => {
  try {
    const { department } = req.params;
    console.log(`🔍 Getting engineers for department: ${department}`);
    
    const engineers = await Engineer.find({ 
      department,
      status: { $in: ['available', 'busy'] } // Exclude offline engineers
    }).sort({ currentTasks: 1, rating: -1 }); // Sort by workload and rating
    
    console.log(`✅ Found ${engineers.length} engineers for ${department}`);
    
    res.json({ success: true, data: engineers });
  } catch (error) {
    console.error('❌ Error fetching engineers:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update engineer status
const updateEngineerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, currentTasks } = req.body;
    
    console.log(`🔄 Updating engineer ${id} status to: ${status}`);
    
    const updateData = { status };
    if (currentTasks !== undefined) {
      updateData.currentTasks = currentTasks;
    }
    
    const engineer = await Engineer.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    if (!engineer) {
      return res.status(404).json({ success: false, error: 'Engineer not found' });
    }
    
    console.log('✅ Engineer status updated:', engineer);
    
    res.json({ success: true, data: engineer });
  } catch (error) {
    console.error('❌ Error updating engineer:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

module.exports = { 
  createEngineer, 
  getAllEngineers, 
  getEngineersByDepartment,
  updateEngineerStatus
};