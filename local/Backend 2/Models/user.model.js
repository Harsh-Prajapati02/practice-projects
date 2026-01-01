const client = require("../utils/db");

// Get all users
const getAllUsers = async () => {
    try {
        const result = await client.query('SELECT * FROM users');
        return result.rows;
    } catch (error) {
        throw new Error('Error fetching users: ' + error.message);
    }
};

// Get user by ID
const getUserById = async (id) => {
    try {
        const result = await client.query('SELECT * FROM users WHERE id = $1', [id]);
        return result.rows[0];
    } catch (error) {
        throw new Error('Error fetching user: ' + error.message);
    }
};

// Create a new user
const createUser = async (name, email) => {
    try {
        const result = await client.query(
            'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
            [name, email]
        );
        return result.rows[0];
    } catch (error) {
        throw new Error('Error creating user: ' + error.message);
    }
};

// Update user by ID
const updateUser = async (id, name, email) => {
    try {
        const result = await client.query(
            'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *',
            [name, email, id]
        );
        return result.rows[0]; // Will be undefined if no user found
    } catch (error) {
        throw new Error('Error updating user: ' + error.message);
    }
};

// Delete user by ID
const deleteUser = async (id) => {
    try {
        const result = await client.query(
            'DELETE FROM users WHERE id = $1 RETURNING *',
            [id]
        );
        return result.rows[0]; // Will be undefined if no user found
    } catch (error) {
        throw new Error('Error deleting user: ' + error.message);
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
};