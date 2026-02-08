const parseFormData = (req, res, next) => {
    try {

      if (req.body.requiredPermissions && typeof req.body.requiredPermissions === 'string') {
        try {
          req.body.requiredPermissions = JSON.parse(req.body.requiredPermissions);
          // Convert string booleans to actual booleans
          for (const key in req.body.requiredPermissions) {
            if (typeof req.body.requiredPermissions[key] === 'string') {
              if (req.body.requiredPermissions[key].toLowerCase() === 'true') {
                req.body.requiredPermissions[key] = true;
              } else if (req.body.requiredPermissions[key].toLowerCase() === 'false') {
                req.body.requiredPermissions[key] = false;
              }
            }
          }
        } catch (err) {
          return res.status(400).json({ message: "Invalid JSON for requiredPermissions" });
        }
      }      if (req.file) {
        req.body.logoUrl = `/uploads/${req.file.filename}`;
      }
      next();
    } catch (error) {
      res.status(400).json({ message: "Invalid JSON for requiredPermissions" });
    }
  };
  
  module.exports = parseFormData;