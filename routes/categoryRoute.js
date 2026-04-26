const express = require('express');

const { getCategories, createCategory, getCategoriey, updateCategory, deleteCategory } = require('../services/categoryService')
const { getCategoryValidator, createCategoryValidator, updateCategoryValidator, deleteCategoryValidator } = require('../utils/validators/categoryValidator')

const router = express.Router();
router.route('/').get(getCategories).post(createCategoryValidator, createCategory);
router.route('/:id').get(getCategoryValidator, getCategoriey).put(updateCategoryValidator, updateCategory).delete(deleteCategoryValidator, deleteCategory);

module.exports = router 
