const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const Brand = require("../models/brandModel"); 
const ApiError = require("../utils/apiError");

// @desc    Get all brands
// @route   GET /api/v1/brands
exports.getBrands = asyncHandler(async (req, res) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 5;
  const skip = (page - 1) * limit;

  const brands = await Brand.find({}).skip(skip).limit(limit);

  res.status(200).json({
    results: brands.length,
    page,
    data: brands,
  });
});

// @desc    Get brand by id
// @route   GET /api/v1/brands/:id
exports.getBrand = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const brand = await Brand.findById(id);

  if (!brand) {
    return next(new ApiError(`No brand for this id ${id}`, 404));
  }

  res.status(200).json({ data: brand });
});

// @desc    Create brand
// @route   POST /api/v1/brands
exports.createBrand = asyncHandler(async (req, res) => {
  const { name } = req.body;

  const brand = await Brand.create({
    name,
    slug: slugify(name),
  });

  res.status(201).json({ data: brand });
});

// @desc    Update brand
// @route   PUT /api/v1/brands/:id
exports.updateBrand = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;

  const brand = await Brand.findByIdAndUpdate(
    id,
    { name, slug: slugify(name) },
    { new: true }
  );

  if (!brand) {
    return next(new ApiError(`No brand for this id ${id}`, 404));
  }

  res.status(200).json({ data: brand });
});

// @desc    Delete brand
// @route   DELETE /api/v1/brands/:id
exports.deleteBrand = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const brand = await Brand.findByIdAndDelete(id);

  if (!brand) {
    return next(new ApiError(`No brand for this id ${id}`, 404));
  }

  res.status(204).send(); 
});