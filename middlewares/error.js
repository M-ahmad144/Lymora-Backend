const ErrorHandler = require("../utils/errorHandler");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // MongoDB ID error (CastError)
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const message = `${Object.keys(err.keyValue)} already exists`;
    err = new ErrorHandler(message, 400);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    err = new ErrorHandler(message, 400);
  }

  // JSON Web Token error (Invalid JWT)
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token. Please log in again.";
    err = new ErrorHandler(message, 401);
  }

  // JWT expired error
  if (err.name === "TokenExpiredError") {
    const message = "Your session has expired. Please log in again.";
    err = new ErrorHandler(message, 401);
  }

  // Missing required fields (e.g., body fields not provided)
  if (err.name === "MissingFieldsError") {
    const message =
      "Some required fields are missing. Please provide all required data.";
    err = new ErrorHandler(message, 400);
  }

  // Unauthorized access error
  if (err.name === "UnauthorizedError") {
    const message = "Unauthorized access to this resource";
    err = new ErrorHandler(message, 403);
  }

  // Route not found (404)
  if (err.name === "NotFoundError") {
    const message = `Cannot find the requested resource`;
    err = new ErrorHandler(message, 404);
  }

  // Rate limit exceeded
  if (err.name === "RateLimitExceeded") {
    const message = "Too many requests. Please try again later.";
    err = new ErrorHandler(message, 429);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    stack: err.stack, // include stack trace for debugging
    error: err, // include raw error object for debugging
  });
};
