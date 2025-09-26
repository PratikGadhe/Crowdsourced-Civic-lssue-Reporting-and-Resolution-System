const mongoose = require('mongoose');

const engineerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxLength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    default: 'engineer123'
  },
  phone: {
    type: String,
    required: true
  },
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  department: {
    type: String,
    required: true,
    enum: ['roads', 'water', 'electricity', 'waste', 'public', 'other']
  },
  specialization: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'busy', 'offline'],
    default: 'available'
  },
  currentTasks: {
    type: Number,
    default: 0
  },
  totalTasksCompleted: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 5.0,
    min: 1,
    max: 5
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Engineer', engineerSchema);