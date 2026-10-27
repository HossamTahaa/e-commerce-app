const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const ApiError = require("../utils/apiError");
const User = require("../models/userModel");

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
  if (!currentUser) {
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
});
