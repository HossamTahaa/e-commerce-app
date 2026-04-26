const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const ApiError = require('../utils/apiError');

const SubCategory = require('../models/subCategoryModel')

//get subCategory, accsess Public
exports.createSubCategory = asyncHandler(async (req, res) => {
  const {name, category } = req.body;
  const subCategory = await SubCategory.create({ name, slug: slugify(name), category });
  res.status(201).json({ data: subCategory });
});

exports.getSubCategories = asyncHandler(async (req, res) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 5;
  const skip = (page - 1) * limit;
  const subCategory = await SubCategory.find({}).skip(skip).limit(limit).populate({ path: 'category', select: 'name -_id' });
  res.status(200).json({ results: subCategory.length, page, data: subCategory });
});

//@ Get subcategory by id
exports.getSubCategoriey = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const subCategory = await SubCategory.findById(id);
  if (!subCategory) {
   return next(new ApiError(`No SubCategory for this id ${id}`, 404));
   }
  res.status(200).json({ data: subCategory });
});

//update subcategory @private
exports.updateSubCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, category } = req.body;
  const subCategory = await SubCategory.findOneAndUpdate(
    { _id: id },
    { name, slug: slugify(name) },
    { new: true },
  );
  if (!subCategory) {
    return next(new ApiError(`No Category for this id ${id}`, 404));
  }
  res.status(200).json({ data: subCategory });
});

//delete category @private
exports.deleteSubCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
   const subCategory = await SubCategory.findByIdAndDelete(id);
  if (!subCategory) {
    return next(new ApiError(`No SubCategory for this id ${id}`, 404));
  }
  res.status(200).send();
});