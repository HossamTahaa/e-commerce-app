const sharp = require("sharp");
const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const factory = require("./handlersFactory");
const { uploadMultipleImages } = require("../middleware/uploadImageMiddleware");
const ProductModel = require("../models/productModel");

// Multer (shared middleware): 1 cover + up to 5 gallery images -> req.files
exports.uploadProductImages = uploadMultipleImages([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 5 },
]);

// Sharp: resize + save each image, then put the names in req.body
exports.resizeProductImages = asyncHandler(async (req, res, next) => {
  if (!req.files) return next(); // no images sent (e.g. JSON update)

  // 1) Image cover (one file)
  if (req.files.imageCover) {
    const imageCoverFileName = `product-${uuidv4()}-${Date.now()}-cover.jpeg`;

    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/products/${imageCoverFileName}`);

    req.body.imageCover = imageCoverFileName;
  }

  // 2) Images (several files) - Promise.all waits for ALL of them
  if (req.files.images) {
    req.body.images = [];

    await Promise.all(
      req.files.images.map(async (img, index) => {
        const imageName = `product-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;

        await sharp(img.buffer)
          .resize(2000, 1333)
          .toFormat("jpeg")
          .jpeg({ quality: 95 })
          .toFile(`uploads/products/${imageName}`);

        req.body.images.push(imageName);
      }),
    );
  }

  next();
});

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
