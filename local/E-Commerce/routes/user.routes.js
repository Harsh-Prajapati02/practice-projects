const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controllers');

// Get all users
router.get('/', userController.getAllUsers);

// Get user by ID
router.get('/:id', userController.getUserById);

// Create a new user
router.post('/', userController.createUser);

module.exports = router;
