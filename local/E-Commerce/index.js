// app.js
const express = require('express');
const productRoutes = require('./routes/product.routes');
const userRoutes = require('./routes/user.routes');
const { pool } = require('./config/db');
require('dotenv').config();

const app = express();

app.use(express.json());


// Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);

// Start Server
app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await pool.end();
  process.exit();
});