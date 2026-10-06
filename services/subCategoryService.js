const factory = require("./handlersFactory");
const SubCategory = require("../models/subCategoryModel");

// nested route: POST /categories/:categoryId/subcategories
exports.setCategoryIdToBody = (req, res, next) => {
  if (!req.body.category) req.body.category = req.params.categoryId;
  next();
};

// nested route: GET /categories/:categoryId/subcategories
exports.createFilterObj = (req, res, next) => {
  req.filterObj = req.params.categoryId
    ? { category: req.params.categoryId }
    : {};
  next();
};

// @desc    Get all subcategories
// @route   GET /api/v1/subcategories   @public
// @route   GET /api/v1/categories/:categoryId/subcategories   @public
exports.getSubCategories = factory.getAll(SubCategory);

// @desc    Get subcategory by id
// @route   GET /api/v1/subcategories/:id   @public
exports.getSubCategory = factory.getOne(SubCategory);

// @desc    Create subcategory
// @route   POST /api/v1/subcategories   @private
exports.createSubCategory = factory.createOne(SubCategory);

// @desc    Update subcategory
// @route   PUT /api/v1/subcategories/:id   @private
exports.updateSubCategory = factory.updateOne(SubCategory);

// @desc    Delete subcategory
// @route   DELETE /api/v1/subcategories/:id   @private
exports.deleteSubCategory = factory.deleteOne(SubCategory);
