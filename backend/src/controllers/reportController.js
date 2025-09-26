const Report = require('../models/Report');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/images';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'report-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Create new report with image upload
const createReport = async (req, res) => {
  try {
    console.log('📍 Received report data:', {
      title: req.body.title,
      category: req.body.category,
      location: req.body.location,
      files: req.files ? req.files.length : 0
    });
    
    // Parse location if it's a string
    let location = req.body.location;
    if (typeof location === 'string') {
      location = JSON.parse(location);
    }
    
    // Prepare report data
    const reportData = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      priority: req.body.priority,
      location: location,
      images: []
    };
    
    // Add image paths if files were uploaded
    if (req.files && req.files.length > 0) {
      reportData.images = req.files.map(file => `/uploads/images/${file.filename}`);
      console.log('📷 Images uploaded:', reportData.images);
    }
    
    const report = new Report(reportData);
    await report.save();
    
    console.log('✅ Report saved to database:', {
      id: report._id,
      location: report.location,
      images: report.images.length
    });
    
    // Emit to dashboard via socket
    req.io.emit('newReport', report);
    
    res.status(201).json({ success: true, data: report });
  } catch (error) {
    console.error('❌ Error creating report:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get all reports
const getReports = async (req, res) => {
  try {
    console.log("get reports called !")
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update report status
const updateReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }
    
    // Emit update to dashboard
    req.io.emit('reportUpdated', report);
    
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

module.exports = { createReport, getReports, updateReport, upload };