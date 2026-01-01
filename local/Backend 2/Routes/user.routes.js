const express = require('express');
const { getController, postController, putController, deleteController, getUserByIdController } = require('../Controllers/user.controller');

const userRouter = express.Router();

// GET route to fetch all users
userRouter.get('/', getController);

// GET route to fetch single user by ID
userRouter.get('/:id', getUserByIdController)

// POST route to create a new user
userRouter.post('/', postController);

// PUT route to update an existing user by ID
userRouter.put('/:id', putController);

// DELETE route to remove a user by ID
userRouter.delete('/:id', deleteController);

module.exports = userRouter;