const express = require('express');

const { getCategories, createCategory, getCategory, updateCategory, deleteCategory, uploadCategoryImage, resizeImage } = require('../services/categoryService')
const { getCategoryValidator, createCategoryValidator, updateCategoryValidator, deleteCategoryValidator } = require('../utils/validators/categoryValidator')
const subCategoryRoute  = require('./subCategoryRoute');
const { protect, allowedTo } = require('../services/auth.service');

const router = express.Router();

// GET: public (anyone can see categories)
// POST / PUT: admin + manager | DELETE: admin only
router.route('/').get(getCategories).post(protect, allowedTo('admin', 'manager'), uploadCategoryImage, resizeImage, createCategoryValidator, createCategory);
router.route('/:id').get(getCategoryValidator, getCategory).put(protect, allowedTo('admin', 'manager'), uploadCategoryImage, resizeImage, updateCategoryValidator, updateCategory).delete(protect, allowedTo('admin'), deleteCategoryValidator, deleteCategory);

router.use('/:categoryId/subcategories', subCategoryRoute );

module.exports = router;
