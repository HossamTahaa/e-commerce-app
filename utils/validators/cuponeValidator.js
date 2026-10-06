const { check } = require('express-validator');
const validatorMiddleware = require('../../middleware/validatorMiddleware');

const nameRules = (chain) =>
  chain
    .isLength({ min: 3 })
    .withMessage('Too short Cupon name')
    .isLength({ max: 32 })
    .withMessage('Too long Cupon name');

exports.getBrandValidator = [
  check('id').isMongoId().withMessage('Invalid Cupon id format'),
  validatorMiddleware,
]; 

exports.createCuponeValidator = [
  nameRules(check('name').notEmpty().withMessage('Cupon required')),
  validatorMiddleware,
];

exports.updateCuponeValidator = [
  check('id').isMongoId().withMessage('Invalid Cupon id format'),
  // nothing is required on update, but whatever is sent must still be valid
  nameRules(check('name').optional()),
  check('image').optional().isString().withMessage('image must be a string'),
  validatorMiddleware,
];


exports.deleteCupobeValidator = [
  check('id').isMongoId().withMessage('Invalid Cupon id format'),
  validatorMiddleware,
];
