const sharp = require("sharp");
const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const factory = require("./handlersFactory");
const ApiError = require("../utils/apiError");
const { uploadSingleImage } = require("../middleware/uploadImageMiddleware");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

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
