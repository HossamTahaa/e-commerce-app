const { check } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const User = require("../../models/userModel");

exports.signupValidator = [
  check("name")
    .notEmpty()
    .withMessage("User name required")
    .bail()
    .isLength({ min: 3 })
    .withMessage("Too short user name"),

  check("email")
    .notEmpty()
    .withMessage("Email required")
    .bail()
    .isEmail()
    .withMessage("Invalid email address")
    .bail()
    .custom((val) =>
      User.findOne({ email: val.toLowerCase() }).then((user) => {
        if (user) {
          return Promise.reject(new Error("Email already in use"));
        }
      }),
    ),

  check("phone")
    .notEmpty()
    .withMessage("Phone required")
    .bail()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Invalid phone number, only Egypt and Saudi numbers are accepted"),

  check("password")
    .notEmpty()
    .withMessage("Password required")
    .bail()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .custom((password, { req }) => {
      if (password !== req.body.passwordConfirm) {
        throw new Error("Password confirmation does not match");
      }
      return true;
    }),

  check("passwordConfirm")
    .notEmpty()
    .withMessage("Password confirmation required"),

  validatorMiddleware,
];

// login only checks the shape of the input - whether the email exists and the
// password is right is checked in the service (with one shared error message)
exports.loginValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email required")
    .bail()
    .isEmail()
    .withMessage("Invalid email address"),

  check("password").notEmpty().withMessage("Password required"),

  validatorMiddleware,
];
