const sharp = require("sharp");
const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const factory = require("./handlersFactory");
const ApiError = require("../utils/apiError");
const { uploadSingleImage } = require("../middleware/uploadImageMiddleware");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Multer (shared middleware): the file in field "profileImage" -> req.file
exports.uploadUserImage = uploadSingleImage("profileImage");

// Sharp: resize + compress, save to disk, then put the name in req.body
exports.resizeImage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(); // no image sent

  const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(600, 600)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`uploads/users/${filename}`);

  // Save image name into DB: createOne / updateOne save req.body
  req.body.profileImage = filename;

  next();
});

exports.getUsers = factory.getAll(User);

exports.getUser = factory.getOne(User);

// @desc    Get logged user data (my profile)
// @route   GET /api/v1/users/getMe
// @access  Private (logged in)
// getUser reads the id from req.params.id, so we put MY id (from the token) there
exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

exports.createUser = factory.createOne(User);

exports.updateUser = asyncHandler(async (req, res, next) => {

  const { id } = req.params;

  const document = await User.findByIdAndUpdate(
    id,
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      profileImage: req.body.profileImage,
      role: req.body.role,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!document) {
    return next(new ApiError(`No user for this id ${id}`, 404));
  }

  res.status(200).json({ data: document });
});

 exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findByIdAndUpdate(
    id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(), // used later to reject old login tokens
    },
    { new: true },
  );
  if (!user) {
    return next(new ApiError(`No user for this id ${id}`, 404));
  }
  res.status(200).json({ data: user });
});

exports.deleteUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findByIdAndUpdate(id, { active: false }, { new: true });

  if (!user) {
    return next(new ApiError(`No user for this id ${id}`, 404));
  }
  res.status(204).send();
});

// @desc    Update logged user password
// @route   PUT /api/v1/users/changeMyPassword
// @access  Private (logged in)
exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  // 1) update the password of the logged user (the id comes from the token, not the URL)
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    { new: true },
  );

  // 2) the old token is now invalid (protect rejects tokens older than passwordChangedAt)
  //    so send a new one, otherwise the user is logged out right away
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });

  res.status(200).json({ data: user, token });
});

// @desc    Update logged user data (without password and role)
// @route   PUT /api/v1/users/updateMe
// @access  Private (logged in)
exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
  // only these 3 fields - role / password / active can NEVER be changed here
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
    },
    { new: true, runValidators: true },
  );

  res.status(200).json({ data: updatedUser });
});

exports.deleteLoggedUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user._id, { active: false }, { new: true });

  if (!user) {
    return next(new ApiError(`No user for this id ${req.user._id}`, 404));
  }
  res.status(204).send();
});