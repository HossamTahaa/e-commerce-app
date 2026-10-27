const express = require("express");
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  uploadUserImage,
  resizeImage,
  changeUserPassword,
} = require("../services/user.service");
const {
  createUserValidator,
  getUserValidator,
  updateUserValidator,
  deleteUserValidator,
  changeUserPasswordValidator,
} = require("../utils/validators/userValidator");

const router = express.Router();

router.put("/changePassword/:id", changeUserPasswordValidator, changeUserPassword);
// order: Multer (read form-data) -> validator -> Sharp (save the image)
// so a request that fails validation never leaves an image on disk
router
  .route("/")
  .get(getUsers)
  .post(uploadUserImage, createUserValidator, resizeImage, createUser);

router
  .route("/:id")
  .get(getUserValidator, getUser)
  .put(uploadUserImage, updateUserValidator, resizeImage, updateUser)
  .delete(deleteUserValidator, deleteUser);

module.exports = router;
