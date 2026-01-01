const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/products.controller');

const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Admin-only routes
router.post('/', authenticateToken, authorizeRoles('admin'), createProduct);
router.put('/:id', authenticateToken, authorizeRoles('admin'), updateProduct);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteProduct);

module.exports = router;