const express = require('express');

const { getSubCategories, getSubCategoriey, createSubCategory, updateSubCategory, deleteSubCategory } = require('../services/subCategoryService')
const { createSubCategoryValidator, getSubCategoryValidator,updateSubCategoryValidator, deleteSubCategoryValidator } = require('../utils/validators/subCategoryValidator')

const router = express.Router();
router.route('/').get(getSubCategories).post(createSubCategoryValidator, createSubCategory)
router.route('/:id').get(getSubCategoryValidator, getSubCategoriey).put(updateSubCategoryValidator, updateSubCategory).delete(deleteSubCategoryValidator, deleteSubCategory)

module.exports = router 
