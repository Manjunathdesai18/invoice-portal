const express = require('express');
const { getDashboardStats } = require('../controllers/dashboardController');
const { exportReports } = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/stats', getDashboardStats);
router.get('/export', exportReports);

module.exports = router;
