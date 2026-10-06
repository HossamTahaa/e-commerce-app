const express = require('express');

const { getSubCategories, getSubCategory, createSubCategory, updateSubCategory, deleteSubCategory, setCategoryIdToBody, createFilterObj } = require('../services/subCategoryService')
const { createSubCategoryValidator, getSubCategoryValidator,updateSubCategoryValidator, deleteSubCategoryValidator } = require('../utils/validators/subCategoryValidator')

// to access paramters on other routers, to access catrgoryid form catrgoy
const router = express.Router({ mergeParams: true });

// createFilterObj belongs on GET (it builds the filter), setCategoryIdToBody on POST
router.route('/').get(createFilterObj, getSubCategories).post(setCategoryIdToBody, createSubCategoryValidator, createSubCategory)
router.route('/:id').get(getSubCategoryValidator, getSubCategory).put(updateSubCategoryValidator, updateSubCategory).delete(deleteSubCategoryValidator, deleteSubCategory)

module.exports = router
