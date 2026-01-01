const express = require('express');
const router = express.Router();
const {
    placeOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    cancelOrder
} = require('../controllers/order.controller');

const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');

// Protected routes
router.use(authenticateToken);

// User routes
router.post('/', placeOrder);
router.get('/my', getMyOrders);
router.get('/:id', getOrderById);
router.delete('/:id', cancelOrder);

// Admin routes
router.get('/', authorizeRoles('admin'), getAllOrders);
router.put('/:id/status', authorizeRoles('admin'), updateOrderStatus);

module.exports = router;