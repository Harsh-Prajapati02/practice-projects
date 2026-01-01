const express = require('express');
const router = express.Router();
const {
    requestReturn,
    getMyReturns,
    getAllReturns,
    updateReturnStatus,
} = require('../controllers/returns.controller');

const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');

router.use(authenticateToken);

// User routes
router.post('/', requestReturn);
router.get('/my', getMyReturns);

// Admin routes
router.get('/', authorizeRoles('admin'), getAllReturns);
router.put('/:id', authorizeRoles('admin'), updateReturnStatus);

module.exports = router;