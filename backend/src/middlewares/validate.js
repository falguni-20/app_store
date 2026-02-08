const validate = (schema) => (req, res, next) => {
    console.log("req.body before validation:", req.body);
    try {
      const parsedBody = schema.parse(req.body);
      req.body = parsedBody; // Replace req.body with validated and parsed data
      
      next();
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({
          message: "Validation failed",
          errors: JSON.parse(error.message).map((err) => ({
            path: err.path,
            message: err.message,
          })),
        });
      }
      next(error); // Pass other errors to the next middleware
    }
  };
  
  module.exports = validate;