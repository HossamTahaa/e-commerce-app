const express = require('express');

const { getCategories, createCategory, getCategoriey, updateCategory, deleteCategory } = require('../services/categoryService')

const router = express.Router();
 
router.route('/').get(getCategories).post(createCategory);
router.route('/:id').get(getCategoriey).put(updateCategory).delete(deleteCategory);

module.exports = router 
