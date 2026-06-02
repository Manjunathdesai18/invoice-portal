const express = require('express');
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getCategories, createCategory } = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/categories')
    .get(getCategories)
    .post(createCategory);

router.route('/')
    .get(getProducts)
    .post(createProduct);

router.route('/:id')
    .get(getProductById)
    .put(updateProduct)
    .delete(deleteProduct);

module.exports = router;
