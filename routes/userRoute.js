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
  getLoggedUserData,
  updateLoggedUserPassword,
  updateLoggedUserData,
  deleteLoggedUser,
} = require("../services/user.service");
const { protect } = require("../services/auth.service");
const {
  createUserValidator,
  getUserValidator,
  updateUserValidator,
  deleteUserValidator,
  changeUserPasswordValidator,
  changeLoggedUserPasswordValidator,
  updateLoggedUserValidator,
} = require("../utils/validators/userValidator");

const router = express.Router();

// must be BEFORE "/:id", otherwise Express thinks "getMe" is an id
router.get("/getMe", protect, getLoggedUserData, getUser);
router.put("/changeMyPassword", protect, changeLoggedUserPasswordValidator, updateLoggedUserPassword);
router.put("/updateMe", protect, updateLoggedUserValidator, updateLoggedUserData);
router.delete("/deleteMe", protect, deleteLoggedUser);

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
