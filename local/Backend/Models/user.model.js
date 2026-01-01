// models/user.model.js
const client = require('../db');

// Get all users
const getAllUsers = async () => {
    const result = await client.query('SELECT * FROM users');
    return result.rows;
};

// Create a new user
const createUser = async (name, email) => {
    const result = await client.query(
        'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
        [name, email]
    );
    return result.rows[0];
};

// Update user by ID
const updateUser = async (id, name, email) => {
    const result = await client.query(
        'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *',
        [name, email, id]
    );
    return result.rows[0];
};

// Delete user by ID
const deleteUser = async (id) => {
    const result = await client.query(
        'DELETE FROM users WHERE id = $1 RETURNING *',
        [id]
    );
    return result.rows[0];
};

module.exports = {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
};