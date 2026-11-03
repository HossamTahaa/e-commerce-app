const express = require("express");
const { signup, login, forgotPassword, verifyPassResetCode } = require("../services/auth.service");
const { signupValidator, loginValidator } = require("../utils/validators/authValidator");

const router = express.Router();

router.post("/signup", signupValidator, signup);
router.post("/login", loginValidator, login);
router.post("/forgotPassword", forgotPassword);
router.post("/verifyResetCode", verifyPassResetCode);

module.exports = router;
