const sharp = require("sharp");
const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const factory = require("./handlersFactory");
const { uploadSingleImage } = require("../middleware/uploadImageMiddleware");
const CategoryModel = require("../models/categoryModel");

// Multer (shared middleware): the file in field "image" -> req.file
exports.uploadCategoryImage = uploadSingleImage("image");

// Sharp: resize + compress, save to disk, then put the name in req.body
exports.resizeImage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(); // no image sent (e.g. update name only)

  const filename = `category-${uuidv4()}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(600, 600)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`uploads/categories/${filename}`);

  // Save image name into DB: createOne / updateOne save req.body
  req.body.image = filename;

  next();
});


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
