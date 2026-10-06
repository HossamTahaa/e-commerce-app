const factory = require("./handlersFactory");
const CategoryModel = require("../models/categoryModel");

// @desc    Get all categories
// @route   GET /api/v1/categories   @public
exports.getCategories = factory.getAll(CategoryModel);

// @desc    Get category by id
// @route   GET /api/v1/categories/:id   @public
exports.getCategory = factory.getOne(CategoryModel);

// @desc    Create category
// @route   POST /api/v1/categories   @private
exports.createCategory = factory.createOne(CategoryModel);

// @desc    Update category
// @route   PUT /api/v1/categories/:id   @private
exports.updateCategory = factory.updateOne(CategoryModel);

// @desc    Delete category
// @route   DELETE /api/v1/categories/:id   @private
exports.deleteCategory = factory.deleteOne(CategoryModel);
