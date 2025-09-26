const mongoose = require('mongoose');
const Engineer = require('./models/Engineer');

const sampleEngineers = [
  // Roads Department Engineers
  {
    name: 'Rajesh Kumar',
    email: 'rajesh.roads@gov.in',
    phone: '+91-9876543210',
    employeeId: 'RD001',
    department: 'roads',
    specialization: 'Road Construction & Repair',
    district: 'Dhule',
    status: 'available',
    rating: 4.8
  },
  {
    name: 'Amit Sharma',
    email: 'amit.roads@gov.in',
    phone: '+91-9876543211',
    employeeId: 'RD002',
    department: 'roads',
    specialization: 'Traffic Management',
    district: 'Mumbai',
    status: 'available',
    rating: 4.6
  },
  
  // Water Department Engineers
  {
    name: 'Priya Patel',
    email: 'priya.water@gov.in',
    phone: '+91-9876543212',
    employeeId: 'WD001',
    department: 'water',
    specialization: 'Pipeline Maintenance',
    district: 'Pune',
    status: 'available',
    rating: 4.9
  },
  {
    name: 'Suresh Joshi',
    email: 'suresh.water@gov.in',
    phone: '+91-9876543213',
    employeeId: 'WD002',
    department: 'water',
    specialization: 'Water Quality Testing',
    district: 'Dhule',
    status: 'available',
    rating: 4.7
  },
  
  // Electricity Department Engineers
  {
    name: 'Vikram Singh',
    email: 'vikram.elec@gov.in',
    phone: '+91-9876543214',
    employeeId: 'ED001',
    department: 'electricity',
    specialization: 'Power Line Maintenance',
    district: 'Mumbai',
    status: 'available',
    rating: 4.5
  },
  
  // Waste Management Engineers
  {
    name: 'Anita Desai',
    email: 'anita.waste@gov.in',
    phone: '+91-9876543215',
    employeeId: 'WM001',
    department: 'waste',
    specialization: 'Waste Collection & Disposal',
    district: 'Pune',
    status: 'available',
    rating: 4.8
  },
  
  // Public Facilities Engineers
  {
    name: 'Ravi Gupta',
    email: 'ravi.public@gov.in',
    phone: '+91-9876543216',
    employeeId: 'PF001',
    department: 'public',
    specialization: 'Building Maintenance',
    district: 'Dhule',
    status: 'available',
    rating: 4.6
  }
];

async function seedEngineers() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/civic-reporter');
    console.log('📡 Connected to MongoDB');
    
    // Clear existing engineers
    await Engineer.deleteMany({});
    console.log('🗑️ Cleared existing engineers');
    
    // Insert sample engineers
    const engineers = await Engineer.insertMany(sampleEngineers);
    console.log(`✅ Created ${engineers.length} sample engineers`);
    
    engineers.forEach(engineer => {
      console.log(`👷 ${engineer.name} - ${engineer.department} - ${engineer.district}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding engineers:', error);
    process.exit(1);
  }
}

seedEngineers();