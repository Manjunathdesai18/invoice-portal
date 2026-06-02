const express = require('express');
const { getSuppliers, createSupplier, deleteSupplier, getPurchases, createPurchase } = require('../controllers/supplierController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getSuppliers)
    .post(createSupplier);

// IMPORTANT: /purchases/all must come BEFORE /:id to avoid route param conflict
router.route('/purchases/all')
    .get(getPurchases)
    .post(createPurchase);

router.route('/:id')
    .delete(deleteSupplier);

module.exports = router;
