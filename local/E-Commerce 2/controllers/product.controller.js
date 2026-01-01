const productModel = require('../models/product.model');

exports.getProducts = async (req, res) => {
  const products = await productModel.getAllProducts();
  res.json(products);
};
