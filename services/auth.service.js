const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const ApiError = require("../utils/apiError");
const User = require("../models/userModel");
const sendEmail = require("../utils/sendEmail");
// make a login token that holds only the user id (never put secrets in it)
const createToken = (payload) =>
  jwt.sign({ userId: payload }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });

// @desc    Signup
// @route   POST /api/v1/auth/signup
// @access  Public
exports.signup = asyncHandler(async (req, res) => {
  // 1) create the user (the password is hashed by pre('save') in the model)
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    password: req.body.password,
  });

  // 2) generate the token
  const token = createToken(user._id);

  // create() returns the saved document WITH the (hashed) password - never send it
  user.password = undefined;

  res.status(201).json({ data: user, token });
});

// @desc    Login
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  // 1) find the user by email (+password, because the model hides it with select: false)
  const user = await User.findOne({ email: req.body.email }).select(
    "+password",
  );

  // 2) no user OR wrong password -> the SAME message, so nobody can test which emails exist
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError("Incorrect email or password", 401));
  }

  // 3) a deactivated user (soft delete) can't log in
  if (!user.active) {
    return next(new ApiError("This account is deactivated", 401));
  }

  // 4) generate the token, and never send the password back
  const token = createToken(user._id);
  user.password = undefined;

  res.status(200).json({ data: user, token });
});

exports.protect = asyncHandler(async (req, res, next) => {
  //check if token exist or no
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new ApiError(
        "you are not login, please login to get accses this route",
        401,
      ),
    );
  }
  // verifiy token (no change happens, expires token)
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  console.log(decoded);
  // 3) Check if user exists
  const currentUser = await User.findById(decoded.userId);
  if (!currentUser || !currentUser.active) {
    return next(
      new ApiError("The user that belongs to this token no longer exists", 401),
    );
  }

  // 4) Check if user changed his password after token created
  if (currentUser.passwordChangedAt) {
    // passwordChangedAt is in milliseconds, the token's iat is in seconds
    const passwordChangedTimestamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10,
    );
    // password changed AFTER the token was created -> the token is old
    if (passwordChangedTimestamp > decoded.iat) {
      return next(
        new ApiError(
          "User recently changed his password, please login again",
          401,
        ),
      );
    }
  }
  if (!currentUser || !currentUser.active) {
  return next(new ApiError("The user that belongs to this token no longer exists", 401));
}

  req.user = currentUser;
  next();
});

exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("You are not allowed to access this route", 403),
      );
    }
    next();
  });

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotPassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // 1) get user by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ApiError("The email not found", 404));
  }

  // 2) generate a random 6-digit code (always 6 digits: 100000 - 999999)
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

  // hash it before saving (like a password: if the DB leaks, the code is useless)
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  user.passwordResetCode = hashedResetCode;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;
  await user.save();
  
    // 3) send the reset code by email
  const message = `Hi ${user.name},\nWe received a request to reset the password on your E-shop account.\n${resetCode}\nEnter this code to complete the reset.\nThanks for helping us keep your account secure.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset code (valid for 10 min)",
      message,
    });
  } catch (err) {
    // the email failed → remove the code, so a code nobody received isn't left in the DB
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;
    await user.save();
    return next(new ApiError("There was an error sending the email", 500));
  }
});

// @desc    Verify password reset code
// @route   POST /api/v1/auth/verifyResetCode
// @access  Public
exports.verifyPassResetCode = asyncHandler(async (req, res, next) => {
  // 1) hash the code the user typed, so we can compare it with the hashed one in the DB
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  // 2) find a user with this code that has NOT expired yet ($gt = greater than now)
  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ApiError("Reset code invalid or expired", 400));
  }

  // 3) the code is correct -> allow the next step (reset password)
  user.passwordResetVerified = true;
  await user.save();

  res.status(200).json({ status: "Success" });
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
  // 1) find the user by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ApiError("The email not found", 404));
  }

  // 2) check if the reset code was verified
  if (!user.passwordResetVerified) {
    return next(
      new ApiError(
        "Reset code not verified, please verify your reset code first",
        400,
      ),
    );
  }
  
  // 3) update the password and clear the reset fields
  user.password = req.body.newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;
  await user.save();

  // 4) generate a new token and send it to the client
  const token = createToken(user._id);
  res.status(200).json({ data: user, token });
});