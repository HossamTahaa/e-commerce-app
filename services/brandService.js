const sharp = require("sharp");
const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const factory = require("./handlersFactory");
const { uploadSingleImage } = require("../middleware/uploadImageMiddleware");
const Brand = require("../models/brandModel");

// Multer (shared middleware): the file in field "image" -> req.file
exports.uploadBrandImage = uploadSingleImage("image");

// Sharp: resize + compress, save to disk, then put the name in req.body
exports.resizeImage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(); // no image sent (e.g. update name only)

  const filename = `brand-${uuidv4()}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(600, 600)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`uploads/brands/${filename}`);

  // Save image name into DB: createOne / updateOne save req.body
  req.body.image = filename;

  next();
});

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
