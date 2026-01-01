// models/product.js
const { pool } = require('../config/db');

// Get all products
const getAllProducts = async () => {
  const query = 'SELECT * FROM products';
  try {
    const { rows } = await pool.query(query);
    return rows;
  } catch (err) {
    throw new Error('Error fetching products');
  }
};

// Get product by ID
const getProductById = async (id) => {
  const query = 'SELECT * FROM products WHERE id = $1';
  try {
    const { rows } = await pool.query(query, [id]);
    return rows[0]; // Return the product (first row)
  } catch (err) {
    throw new Error('Error fetching product');
  }
};

// Create a new product
const createProduct = async (name, description, price, stock) => {
  const query = `
    INSERT INTO products (name, description, price, stock)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  try {
    const { rows } = await pool.query(query, [name, description, price, stock]);
    return rows[0]; // Return the created product
  } catch (err) {
    throw new Error('Error creating product');
  }
};

module.exports = { getAllProducts, getProductById, createProduct };