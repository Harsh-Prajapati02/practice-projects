const { getPool } = require('../config/db');
const pool = getPool();

// Utility to handle errors
const handleServerError = (res, err, message = "Internal server error", status = 500) => {
  console.error(message, err);
  return res.status(status).json({ error: message });
};

// GET /products 
async function getAllProducts(_req, res) {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    return res.status(200).json({
      message: `Fetched ${result.rows.length} products successfully`,
      data: result.rows,
    });
  } catch (err) {
    return handleServerError(res, err);
  }
}

// GET /products/:id
async function getProductById(req, res) {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.status(200).json({
      message: "Product retrieved successfully",
      data: result.rows[0],
    });
  } catch (err) {
    return handleServerError(res, err);
  }
}

// POST /products
async function createProduct(req, res) {
  const { title, description = null, price, stock, status } = req.body;

  // Validate required fields with detailed messages
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: "Invalid or missing 'title'" });
  }
  if (price == null || typeof price !== 'number' || price < 0) {
    return res.status(400).json({ error: "Invalid or missing 'price'" });
  }
  if (stock == null || !Number.isInteger(stock) || stock < 0) {
    return res.status(400).json({ error: "Invalid or missing 'stock'" });
  }
  if (!status || typeof status !== 'string' || status.trim() === '') {
    return res.status(400).json({ error: "Invalid or missing 'status'" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO products (title, description, price, stock, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title.trim(), description, price, stock, status.trim()]
    );

    return res.status(201).json({
      message: "Product created successfully",
      data: result.rows[0],
    });
  } catch (err) {
    return handleServerError(res, err);
  }
}

// PUT /products/:id
async function updateProduct(req, res) {
  const { id } = req.params;
  const { title, description, price, stock, status } = req.body;

  try {
    const check = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Allow partial updates (if a field is missing, keep old value)
    const product = check.rows[0];

    // Validate fields if provided
    const updatedTitle = title !== undefined ? title.trim() : product.title;
    if (title !== undefined && (typeof title !== 'string' || updatedTitle === '')) {
      return res.status(400).json({ error: "Invalid 'title'" });
    }

    const updatedDescription = description !== undefined ? description : product.description;

    const updatedPrice = price !== undefined ? price : product.price;
    if (price !== undefined && (typeof price !== 'number' || updatedPrice < 0)) {
      return res.status(400).json({ error: "Invalid 'price'" });
    }

    const updatedStock = stock !== undefined ? stock : product.stock;
    if (stock !== undefined && (!Number.isInteger(updatedStock) || updatedStock < 0)) {
      return res.status(400).json({ error: "Invalid 'stock'" });
    }

    const updatedStatus = status !== undefined ? status.trim() : product.status;
    if (status !== undefined && (typeof status !== 'string' || updatedStatus === '')) {
      return res.status(400).json({ error: "Invalid 'status'" });
    }

    const result = await pool.query(
      `UPDATE products
       SET title = $1, description = $2, price = $3, stock = $4, status = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [updatedTitle, updatedDescription, updatedPrice, updatedStock, updatedStatus, id]
    );

    return res.status(200).json({
      message: "Product updated successfully",
      data: result.rows[0],
    });
  } catch (err) {
    return handleServerError(res, err);
  } 
}

// DELETE /products/:id
async function deleteProduct(req, res) {
  const { id } = req.params;

  try {
    const check = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await pool.query('DELETE FROM products WHERE id = $1', [id]);

    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    return handleServerError(res, err);
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};