const { check } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const bcrypt = require("bcryptjs");
const User = require("../../models/userModel");

// the email must not belong to another user (nicer message than the DB duplicate error)
const emailNotUsed = (chain) =>
  chain
    .isEmail()
    .withMessage("Invalid email address")
    .custom((val)=> User.findOne({email: val}).then((user)=> {
        if (user){
          return Promise.reject(new Error ('is exsit'))
        }
      })) 

 const phoneRules = (chain) =>
  chain
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Invalid phone number, only Egypt and Saudi numbers are accepted");

exports.createUserValidator = [
  check("name")
    .notEmpty()
    .withMessage("User name required")
    .bail()
    .isLength({ min: 3 })
    .withMessage("Too short user name"),

  emailNotUsed(check("email").notEmpty().withMessage("Email required").bail()),
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

  phoneRules(check("phone").notEmpty().withMessage("Phone required").bail()),

  check("profileImage").optional(),

  check("role")
    .optional()
    .isIn(["user", "admin"])
    .withMessage("Role must be user or admin"),

  validatorMiddleware,
];

exports.getUserValidator = [
  check("id").isMongoId().withMessage("Invalid user id format"),
  validatorMiddleware,
];

exports.updateUserValidator = [
  check("id").isMongoId().withMessage("Invalid user id format"),

  // nothing is required on update, but whatever is sent must still be valid
  check("name").optional().isLength({ min: 3 }).withMessage("Too short user name"),
  emailNotUsed(check("email").optional()),
  phoneRules(check("phone").optional()),
  check("profileImage").optional(),
  check("role")
    .optional()
    .isIn(["user", "admin"])
    .withMessage("Role must be user or admin"),

  // the password has its own change-password endpoint (lessons 106-107),
  // so it can't sneak in through a normal update (it would be saved unhashed)
  check("password")
    .not()
    .exists()
    .withMessage("Use the change password endpoint to update the password"),

  validatorMiddleware,
];

exports.deleteUserValidator = [
  check("id").isMongoId().withMessage("Invalid user id format"),
  validatorMiddleware,
];

 exports.changeUserPasswordValidator = [
  check("id").isMongoId().withMessage("Invalid user id format"),

  check("currentPassword")
    .notEmpty()
    .withMessage("You must enter your current password"),

  check("passwordConfirm")
    .notEmpty()
    .withMessage("You must enter the password confirm"),

  check("password")
    .notEmpty()
    .withMessage("You must enter the new password")
    .bail()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .bail()
    .custom(async (password, { req }) => {
      // 1) the user exists? (+password because the model hides it with select: false)
      const user = await User.findById(req.params.id).select("+password");
      if (!user) {
        throw new Error("There is no user for this id");
      }

      // 2) the current password is correct?
      const isCorrect = await bcrypt.compare(
        req.body.currentPassword || "",
        user.password,
      );
      if (!isCorrect) {
        throw new Error("Incorrect current password");
      }

      // 3) the new password matches the confirmation?
      if (password !== req.body.passwordConfirm) {
        throw new Error("Password confirmation does not match");
      }

      return true;
    }),

  validatorMiddleware,
];

// lesson 126: same as changeUserPasswordValidator, but for the LOGGED user
// (the id comes from the token -> req.user._id, so protect must run first)
exports.changeLoggedUserPasswordValidator = [
  check("currentPassword")
    .notEmpty()
    .withMessage("You must enter your current password"),

  check("passwordConfirm")
    .notEmpty()
    .withMessage("You must enter the password confirm"),

  check("password")
    .notEmpty()
    .withMessage("You must enter the new password")
    .bail()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .bail()
    .custom(async (password, { req }) => {
      // the current password is correct?
      const user = await User.findById(req.user._id).select("+password");
      const isCorrect = await bcrypt.compare(
        req.body.currentPassword || "",
        user.password,
      );
      if (!isCorrect) {
        throw new Error("Incorrect current password");
      }

      // the new password matches the confirmation?
      if (password !== req.body.passwordConfirm) {
        throw new Error("Password confirmation does not match");
      }

      return true;
    }),

  validatorMiddleware,
];

// lesson 127: the logged user edits his own name / email / phone
exports.updateLoggedUserValidator = [
  check("name")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Too short user name"),

  check("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email address")
    .bail()
    .custom((val, { req }) =>
      User.findOne({ email: val.toLowerCase() }).then((user) => {
        // used by ANOTHER user? (your own email is fine)
        if (user && user._id.toString() !== req.user._id.toString()) {
          return Promise.reject(new Error("Email already in use"));
        }
      }),
    ),

  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Invalid phone number, only Egypt and Saudi numbers are accepted"),

  validatorMiddleware,
];
