/**
 * Middleware to validate request data using Zod schemas
 * @param {Object} schema - Zod schema to validate against
 * @param {String} source - Request property to validate (body, query, params)
 */
const validate = (schema, source = "body") => (req, res, next) => {
  try {
    console.log(`Validating ${source}:`, req[source]);
    
    // Validate the request data against the schema
    const data = schema.parse(req[source]);
    
    // Attach the validated data to request
    req[source] = data;
    console.log('Validation successful');
    next();
  } catch (error) {
    console.error('Validation error:', error);
    
    // Format Zod validation errors
    const formattedErrors = error.errors.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    
    // Directly send the response instead of passing to next error handler
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: formattedErrors,
      details: error.message // Add the full error message for clarity
    });
  }
};

module.exports = { validate }; 