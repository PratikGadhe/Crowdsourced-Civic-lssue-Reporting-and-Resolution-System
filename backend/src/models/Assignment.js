const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  location: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true,
    enum: ['roads', 'water', 'electricity', 'waste', 'public', 'other']
  },
  departmentName: {
    type: String,
    required: true
  },
  reports: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report'
  }],
  reportsCount: {
    type: Number,
    required: true
  },
  note: {
    type: String,
    maxLength: 500
  },
  assignedBy: {
    type: String,
    required: true
  },
  assignedByName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['assigned', 'in-progress', 'completed'],
    default: 'assigned'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Assignment', assignmentSchema);