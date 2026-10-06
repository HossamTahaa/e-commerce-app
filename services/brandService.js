const factory = require("./handlersFactory");
const Brand = require("../models/brandModel");

// @desc    Get all brands
// @route   GET /api/v1/brands   @public
exports.getBrands = factory.getAll(Brand);

// @desc    Get brand by id
// @route   GET /api/v1/brands/:id   @public
exports.getBrand = factory.getOne(Brand);

// @desc    Create brand
// @route   POST /api/v1/brands   @private
exports.createBrand = factory.createOne(Brand);

// @desc    Update brand
// @route   PUT /api/v1/brands/:id   @private
exports.updateBrand = factory.updateOne(Brand);

// @desc    Delete brand
// @route   DELETE /api/v1/brands/:id   @private
exports.deleteBrand = factory.deleteOne(Brand);
