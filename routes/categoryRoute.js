const express = require('express');

const { getCategories, createCategory, getCategory, updateCategory, deleteCategory, uploadCategoryImage, resizeImage } = require('../services/categoryService')
const { getCategoryValidator, createCategoryValidator, updateCategoryValidator, deleteCategoryValidator } = require('../utils/validators/categoryValidator')
const subCategoryRoute  = require('./subCategoryRoute');

const router = express.Router();
router.route('/').get(getCategories).post(uploadCategoryImage, resizeImage, createCategoryValidator, createCategory);
router.route('/:id').get(getCategoryValidator, getCategory).put(uploadCategoryImage, resizeImage, updateCategoryValidator, updateCategory).delete(deleteCategoryValidator, deleteCategory);

router.use('/:categoryId/subcategories', subCategoryRoute );

module.exports = router;
