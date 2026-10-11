const express = require('express');
const { getProductValidator, createProductValidator, updateProductValidator, deleteProductValidator} = require('../utils/validators/productValidator');
const  { getProducts, getProduct, createProduct, updateProduct,deleteProduct, uploadProductImages, resizeProductImages} = require ('../services/productService');

const router = express.Router();

// resizeProductImages runs BEFORE the validator: imageCover is required,
// and it only lands in req.body after Sharp sets it
router.route('/').get(getProducts).post(uploadProductImages, resizeProductImages, createProductValidator, createProduct)
router.route('/:id').get(getProductValidator, getProduct)
.put(uploadProductImages, resizeProductImages, updateProductValidator, updateProduct)
.delete(deleteProductValidator, deleteProduct)

module.exports = router;
