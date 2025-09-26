const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxLength: 100
  },
  description: {
    type: String,
    required: true,
    maxLength: 500
  },
  category: {
    type: String,
    required: true,
    enum: ['roads', 'water', 'electricity', 'waste', 'public','other']
  },
  priority: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high']
  },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String, required: true }
  },
  images: [String],
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved'],
    default: 'pending'
  },
  reportedBy: String,
  assignedTo: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Report', reportSchema);