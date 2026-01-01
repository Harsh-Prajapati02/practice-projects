const express = require('express');
const productController = require('../controllers/product.controller');
const authMiddleware = require('../middlewares/authMiddleware');

const productRouter = express.Router();

productRouter.get('/', authMiddleware, productController.getProducts);

module.exports = productRouter;
