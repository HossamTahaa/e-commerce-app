const multer = require("multer");
const ApiError = require("../utils/apiError");

// shared Multer setup for every resource that uploads images
// (categories, brands, later products)

// MemoryStorage: keep the file in RAM (req.file.buffer), Sharp saves the final version
const multerStorage = multer.memoryStorage();

// accept images only
const multerFilter = function (req, file, cb) {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new ApiError("Only images allowed", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5 MB
});

// reads form-data: text -> req.body, the file in field `fieldName` -> req.file
exports.uploadSingleImage = (fieldName) => upload.single(fieldName);
