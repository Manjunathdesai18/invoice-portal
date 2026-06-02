const express = require('express');
const { generateDescription, getPredictiveInsights, getSmartAdvice, getInventoryInsights } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/generate-description', generateDescription);
router.get('/predict-revenue', getPredictiveInsights);
router.get('/smart-advice', getSmartAdvice);
router.get('/predict-inventory', getInventoryInsights);

module.exports = router;
