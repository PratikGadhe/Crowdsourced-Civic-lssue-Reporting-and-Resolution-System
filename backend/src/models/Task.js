const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  engineerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Engineer',
    required: true
  },
  engineerName: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  department: {
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
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['assigned', 'accepted', 'in-progress', 'completed', 'approved', 'revision-requested', 'verified'],
    default: 'assigned'
  },
  assignedBy: {
    type: String,
    required: true
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  acceptedAt: Date,
  startedAt: Date,
  completedAt: Date,
  verifiedAt: Date,
  approvedAt: Date,
  approvedBy: String,
  rejectedAt: Date,
  rejectedBy: String,
  rejectionReason: String,
  notes: String,
  completionPhotos: [String],
  estimatedDuration: Number, // in hours
  actualDuration: Number // in hours
}, {
  timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);