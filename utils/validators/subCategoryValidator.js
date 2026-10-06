const { check } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const Category = require("../../models/categoryModel");

const nameRules = (chain) =>
  chain
    .isLength({ min: 2 })
    .withMessage("Too short Subcategory name")
    .isLength({ max: 32 })
    .withMessage("Too long Subcategory name");

// the parent must actually exist, otherwise we store a dangling reference
const categoryExists = (chain) =>
  chain
    .isMongoId()
    .withMessage("Invalid category id format")
    .custom((categoryId) =>
      Category.findById(categoryId).then((category) => {
        if (!category) {
          return Promise.reject(
            new Error(`No category for this id: ${categoryId}`),
          );
        }
      }),
    );

exports.getSubCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid Subcategory id format"),
  validatorMiddleware,
];

exports.createSubCategoryValidator = [
  nameRules(check("name").notEmpty().withMessage("SubCategory required")),
  categoryExists(
    check("category")
      .notEmpty()
      .withMessage("subCategory must belong to a category"),
  ),
  validatorMiddleware,
];

exports.updateSubCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid Subcategory id format"),
  // nothing is required on update, but whatever is sent must still be valid
  nameRules(check("name").optional()),
  categoryExists(check("category").optional()),
  validatorMiddleware,
];

exports.deleteSubCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid Subcategory id format"),
  validatorMiddleware,
];
