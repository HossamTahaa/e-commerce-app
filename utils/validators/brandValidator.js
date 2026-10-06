const { check } = require('express-validator');
const validatorMiddleware = require('../../middleware/validatorMiddleware');

const nameRules = (chain) =>
  chain
    .isLength({ min: 3 })
    .withMessage('Too short Brand name')
    .isLength({ max: 32 })
    .withMessage('Too long Brand name');

exports.getBrandValidator = [
  check('id').isMongoId().withMessage('Invalid Brand id format'),
  validatorMiddleware,
];

exports.createBrandValidator = [
  nameRules(check('name').notEmpty().withMessage('Brand required')),
  validatorMiddleware,
];

exports.updateBrandValidator = [
  check('id').isMongoId().withMessage('Invalid Brand id format'),
  // nothing is required on update, but whatever is sent must still be valid
  nameRules(check('name').optional()),
  check('image').optional().isString().withMessage('image must be a string'),
  validatorMiddleware,
];

exports.deleteBrandValidator = [
  check('id').isMongoId().withMessage('Invalid Brand id format'),
  validatorMiddleware,
];
