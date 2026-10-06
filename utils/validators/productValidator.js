const { check } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const Category = require("../../models/categoryModel");
const SubCategory = require("../../models/subCategoryModel");
const Brand = require("../../models/brandModel");

// create requires the core fields, update reuses the exact same rules but
// makes everything optional - so the two can never drift apart
const requiredOr = (chain, optional, message) =>
  optional ? chain.optional() : chain.notEmpty().withMessage(message);

const productRules = (optional) => [
  requiredOr(check("title"), optional, "Product required")
    .isLength({ min: 3 })
    .withMessage("must be at least 3 chars")
    .isLength({ max: 100 })
    .withMessage("Too long product title"),

  requiredOr(
    check("description"),
    optional,
    "Product description is required",
  )
    .isLength({ min: 20 })
    .withMessage("Too short description")
    .isLength({ max: 2000 })
    .withMessage("Too long description"),

  requiredOr(check("quantity"), optional, "Product quantity is required")
    .isInt({ min: 0 })
    .withMessage("Product quantity must be a positive number"),

  check("sold")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Product sold must be a positive number"),

  requiredOr(check("price"), optional, "Product price is required")
    .isNumeric()
    .withMessage("Product price must be a number")
    .toFloat()
    // must match the max in productModel (20000) or mongoose rejects it later
    .isFloat({ min: 0, max: 20000 })
    .withMessage("Too long price"),

  check("priceAfterDiscount")
    .optional()
    .isNumeric()
    .withMessage("Product priceAfterDiscount must be a number")
    .toFloat()
    .custom((value, { req }) => {
      // on update the price may not be in the body - nothing to compare against
      if (req.body.price !== undefined && req.body.price <= value) {
        throw new Error("priceAfterDiscount must be lower than price");
      }
      return true;
    }),

  check("colors")
    .optional()
    .isArray()
    .withMessage("availableColors should be array of string"),

  requiredOr(check("imageCover"), optional, "Product imageCover is required"),

  check("images")
    .optional()
    .isArray()
    .withMessage("images should be array of string"),

  requiredOr(
    check("category"),
    optional,
    "Product must be belong to a category",
  )
    .isMongoId()
    .withMessage("Invalid ID formate")
    .custom((categoryId) =>
      Category.findById(categoryId).then((category) => {
        if (!category) {
          return Promise.reject(
            new Error(`No category for this id: ${categoryId}`),
          );
        }
      }),
    ),

  // subcategories is an array, so isMongoId must run on each element (".*")
  check("subcategories")
    .optional()
    .isArray()
    .withMessage("subcategories should be an array of ids"),
  check("subcategories.*")
    .optional()
    .isMongoId()
    .withMessage("Invalid subcategory ID formate"),
  check("subcategories")
    .optional()
    .custom((subcategoriesIds) =>
      SubCategory.find({ _id: { $in: subcategoriesIds } }).then((result) => {
        if (result.length !== subcategoriesIds.length) {
          return Promise.reject(new Error(`Invalid subcategories Ids`));
        }
      }),
    )
    .custom((subcategoriesIds, { req }) => {
      // without a category in the body there is nothing to check them against
      if (!req.body.category) return true;

      return SubCategory.find({ category: req.body.category }).then(
        (subcategories) => {
          const idsInDB = subcategories.map((sub) => sub._id.toString());
          const allBelong = subcategoriesIds.every((id) =>
            idsInDB.includes(id),
          );
          if (!allBelong) {
            return Promise.reject(
              new Error(`subcategories not belong to category`),
            );
          }
        },
      );
    }),

  check("brand")
    .optional()
    .isMongoId()
    .withMessage("Invalid ID formate")
    .custom((brandId) =>
      Brand.findById(brandId).then((brand) => {
        if (!brand) {
          return Promise.reject(new Error(`No brand for this id: ${brandId}`));
        }
      }),
    ),

  // isLength is for strings - a number range needs isFloat
  check("ratingsAverage")
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage("Rating must be between 1.0 and 5.0"),

  check("ratingsQuantity")
    .optional()
    .isInt({ min: 0 })
    .withMessage("ratingsQuantity must be a positive number"),
];

exports.getProductValidator = [
  check("id").isMongoId().withMessage("Invalid ID formate"),
  validatorMiddleware,
];

exports.createProductValidator = [
  ...productRules(false),
  validatorMiddleware,
];

exports.updateProductValidator = [
  check("id").isMongoId().withMessage("Invalid ID formate"),
  ...productRules(true),
  validatorMiddleware,
];

exports.deleteProductValidator = [
  check("id").isMongoId().withMessage("Invalid ID formate"),
  validatorMiddleware,
];
