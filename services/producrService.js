const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const ProductModel = require("../models/productModel")
const ApiError = require("../utils/apiError");

//get all product
const getProducts = asyncHandler(async (req, res) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 5;
  const skip = (page - 1) * limit;
  const Products = await ProductModel.find({}).skip(skip).limit(limit).populate({path:"category", select:'name -_id'});
  res.status(200).json({ results: Products.length, page, data: Products });
});

//@ Get Product by id
getProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const Product = await ProductModel.findById(id).populate({path:"category", select: 'name'});
  if (!Product) {
    return next(new ApiError(`No Product for this id ${id}`, 404));
  }
  res.status(200).json({ data: Product });
});

//@create Product @private
  createProduct = asyncHandler(async (req, res) => {
  req.body.slug = slugify(req.body.title);
  const Product = await ProductModel.create(req.body);
  res.status(201).json({ data: Product });
});

//update Product @private
updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  const Product = await ProductModel.findOneAndUpdate(
    { _id: id },
    { title, slug: slugify(title) },
    { new: true },
  );
    if (!Product) {
    return next(new ApiError(`No Product for this id ${id}`, 404));
  }
  res.status(200).json({ data: Product });
});

//delete Product @private
deleteProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const Product = await ProductModel.findByIdAndDelete(id);
  if (!Product) {
    return next(new ApiError(`No Product for this id ${id}`, 404));
  }
  res.status(200).send();
});

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
