const express = require('express');
// const cors = require('cors');
require('dotenv').config();
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
// app.use(cors());
app.use(express.json());

app.use('/api/auth', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${process.env.PORT}`));