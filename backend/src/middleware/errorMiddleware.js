/**
 * Custom error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  // Get status code from the error or default to 500
  const statusCode = err.statusCode || 500;
  
  // Structure the error response
  const errorResponse = {
    message: err.message || "Server Error",
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  };
  
  // If there are validation errors, include them
  if (err.errors) {
    errorResponse.errors = err.errors;
  }
  
  // Send the error response
  res.status(statusCode).json(errorResponse);
};

module.exports = { errorHandler }; 