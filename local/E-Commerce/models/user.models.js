const bcrypt = require('bcrypt');
const { pool } = require('../config/db');

// Get all users
const getAllUsers = async () => {
  const query = 'SELECT * FROM users';
  try {
    const { rows } = await pool.query(query);
    return rows;
  } catch (err) {
    throw new Error('Error fetching users');
  }
};

// Create a new user with hashed password
const createUser = async (name, email, password) => {
  const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

  const query = `
    INSERT INTO users (name, email, password)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  try {
    const { rows } = await pool.query(query, [name, email, hashedPassword]);
    return rows[0]; // Return the created user
  } catch (err) {
    throw new Error('Error creating user');
  }
};

// Find user by email
const getUserByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE email = $1';
  try {
    const { rows } = await pool.query(query, [email]);
    return rows[0]; // Return the user if found
  } catch (err) {
    throw new Error('Error fetching user by email');
  }
};

// Compare passwords
const comparePassword = async (enteredPassword, storedPassword) => {
  return bcrypt.compare(enteredPassword, storedPassword); // Compare entered password with hashed password
};

module.exports = { getAllUsers, createUser, getUserByEmail, comparePassword };
