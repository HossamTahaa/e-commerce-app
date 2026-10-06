const factory = require("./handlersFactory");
const ProductModel = require("../models/productModel");

// @desc    Get list of products
// @route   GET /api/v1/products
// @access  Public
exports.getProducts = factory.getAll(ProductModel);

// @desc    Get product by id
// @route   GET /api/v1/products/:id   @public
exports.getProduct = factory.getOne(ProductModel);

// @desc    Create product
// @route   POST /api/v1/products   @private
exports.createProduct = factory.createOne(ProductModel);

// @desc    Update product
// @route   PUT /api/v1/products/:id   @private
exports.updateProduct = factory.updateOne(ProductModel);

// @desc    Delete product
// @route   DELETE /api/v1/products/:id   @private
exports.deleteProduct = factory.deleteOne(ProductModel);
