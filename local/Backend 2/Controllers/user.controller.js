const userModel = require('../Models/user.model');

// GET Controller
const getController = async (req, res) => {
    try {
        const users = await userModel.getAllUsers();

        if (users.length === 0) {
            return res.status(404).json({ message: 'No users found' });
        }

        res.status(200).json({
            message: 'Users retrieved successfully',
            data: users,
        });
    } catch (error) {
        console.error('Query error:', error.stack);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// GET user by ID
const getUserByIdController = async (req, res) => {
    const { id } = req.params;

    // Validate input
    if (!id || isNaN(id)) {
        return res.status(400).json({ message: 'Invalid or missing user ID.' });
    }

    try {
        const user = await userModel.getUserById(id);

        if (!user) {
            return res.status(404).json({ message: `User with ID ${id} not found.` });
        }

        res.status(200).json({
            message: 'User retrieved successfully.',
            data: user,
        });
    } catch (error) {
        console.error('Error fetching user by ID:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// POST Controller
const postController = async (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({ message: 'Name and email are required' });
    }

    try {
        const newUser = await userModel.createUser(name, email);

        res.status(201).json({
            message: 'User created successfully',
            data: newUser,
        });
    } catch (error) {
        console.error('Query error:', error.stack);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// PUT Controller
const putController = async (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({ message: 'Name and email are required for update' });
    }

    try {
        const updatedUser = await userModel.updateUser(id, name, email);

        if (!updatedUser) {
            return res.status(404).json({ message: `User with ID ${id} not found` });
        }

        res.status(200).json({
            message: 'User updated successfully',
            data: updatedUser,
        });
    } catch (error) {
        console.error('Query error:', error.stack);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// DELETE Controller
const deleteController = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedUser = await userModel.deleteUser(id);

        if (!deletedUser) {
            return res.status(404).json({ message: `User with ID ${id} not found` });
        }

        res.status(200).json({
            message: 'User deleted successfully',
            data: deletedUser,
        });
    } catch (error) {
        console.error('Query error:', error.stack);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    getController,
    getUserByIdController,
    postController,
    putController,
    deleteController,
};