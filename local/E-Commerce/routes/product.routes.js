const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controllers');

// Get all products
router.get('/', productController.getAllProducts);

// Get product by ID
router.get('/:id', productController.getProductById);

// Create a new product
router.post('/', productController.createProduct);

module.exports = router;
