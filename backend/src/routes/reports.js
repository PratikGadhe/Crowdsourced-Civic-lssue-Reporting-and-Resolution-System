const express = require('express');
const { createReport, getReports, updateReport, upload } = require('../controllers/reportController');

const router = express.Router();

router.post('/', upload.array('images', 5), createReport);
router.get('/', getReports);
router.put('/:id', updateReport);

module.exports = router;