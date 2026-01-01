const express = require('express');
const router = express.Router();
const {
    placeOrder,
    updateOrderStatus,
    returnOrder,
    cancelOrder,
    getAllOrders
} = require('../controllers/orderController');

router.post('/', placeOrder);
router.get('/', getAllOrders);
router.put('/:id/status', updateOrderStatus);
router.post('/:id/return', returnOrder);
router.post('/:id/cancel', cancelOrder);

module.exports = router;