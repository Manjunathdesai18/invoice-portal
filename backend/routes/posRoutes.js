const express = require('express');
const { processCheckout } = require('../controllers/posController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/checkout', processCheckout);

module.exports = router;
