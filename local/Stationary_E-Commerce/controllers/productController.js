const pool = require('../config/db');

exports.createProduct = async (req, res) => {
  const { name, description, price, stock } = req.body;
  const status = stock > 0 ? 'in-stock' : 'sold';

  try {
    const result = await pool.query(
      'INSERT INTO products (name, description, price, stock, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description, price, stock, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProducts = async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateStockStatus = async (productId, quantityChange) => {
  const product = await pool.query('SELECT * FROM products WHERE id = $1', [productId]);
  if (product.rows.length === 0) throw new Error('Product not found');

  let stock = product.rows[0].stock + quantityChange;
  if (stock < 0) stock = 0;

  let status = stock <= 0 ? 'sold' : 'in-stock';

  await pool.query('UPDATE products SET stock = $1, status = $2 WHERE id = $3', [
    stock,
    status,
    productId,
  ]);
};

exports.updateProduct = async (req, res) => {
  const productId = req.params.id;
  const { name, description, price, stock } = req.body;
  const status = stock > 0 ? 'in-stock' : 'sold';

  try {
    const result = await pool.query(
      `UPDATE products 
       SET name = $1, description = $2, price = $3, stock = $4, status = $5
       WHERE id = $6
       RETURNING *`,
      [name, description, price, stock, status, productId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  const productId = req.params.id;

  try {
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [productId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully', product: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};