exports.requireRole = (roles) => (req, res, next) => {
    // Check both organization roles and institute roles
    const orgRoles = req.user.organizations.map(org => org.role);
    const instRoles = req.user.institutes.map(inst => inst.role);
    
    // Combine all roles
    const allRoles = [...orgRoles, ...instRoles];
    const hasRole = allRoles.some(role => roles.includes(role));

    if (!hasRole) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
  