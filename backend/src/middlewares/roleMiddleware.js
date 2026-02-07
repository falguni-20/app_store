exports.requireRole = (roles) => (req, res, next) => {
    const userRole = req.user.role; // from JWT
    if (!roles.includes(userRole)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
  