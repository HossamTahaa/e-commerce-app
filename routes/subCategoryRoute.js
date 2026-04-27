const express = require('express');

const { getSubCategories, getSubCategoriey, createSubCategory, updateSubCategory, deleteSubCategory, setCategoryIdToBody,createFilterObj } = require('../services/subCategoryService')
const { createSubCategoryValidator, getSubCategoryValidator,updateSubCategoryValidator, deleteSubCategoryValidator } = require('../utils/validators/subCategoryValidator')

// to access paramters on other routers, to access catrgoryid form catrgoy
const router = express.Router({ mergeParams: true });

router.route('/').get(getSubCategories).post(createFilterObj, setCategoryIdToBody, createSubCategoryValidator, createSubCategory)
router.route('/:id').get(getSubCategoryValidator, getSubCategoriey).put(updateSubCategoryValidator, updateSubCategory).delete(deleteSubCategoryValidator, deleteSubCategory)

module.exports = router 
