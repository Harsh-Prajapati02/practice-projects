const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');

router.get('/me', authenticateToken, userCtrl.getMe);
router.get('/', authenticateToken, authorizeRoles('admin'), userCtrl.getAllUsers);
router.get('/:id', authenticateToken, authorizeRoles('admin'), userCtrl.getUserById);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), userCtrl.deleteUser);

module.exports = router;