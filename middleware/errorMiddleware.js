const ApiError = require("../utils/apiError");

// bad ObjectId in the url  ->  400 instead of 500
const handleCastError = (err) =>
  new ApiError(`Invalid ${err.path}: ${err.value}`, 400);

// unique index violation  ->  400 instead of 500
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue || {})[0];
  return new ApiError(`Duplicate value for "${field}", please use another`, 400);
};

// mongoose schema validation  ->  400 instead of 500
const handleValidationError = (err) => {
  const messages = Object.values(err.errors).map((e) => e.message);
  return new ApiError(messages.join(". "), 400);
};

const sendErrorForDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorForProduction = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

const globalError = (err, req, res, next) => {
  let error = err;

  if (error.name === "CastError") error = handleCastError(error);
  else if (error.code === 11000) error = handleDuplicateKeyError(error);
  else if (error.name === "ValidationError") error = handleValidationError(error);

  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorForDev(error, res);
  } else {
    sendErrorForProduction(error, res);
  }
};

module.exports = globalError;
