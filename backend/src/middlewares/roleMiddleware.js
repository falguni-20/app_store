exports.requireRole = (roles) => (req, res, next) => {
    let hasRole = false;

    // Check if we have organization context
    if (req.orgId) {
        // Check if user has the required role in the specific organization
        const orgMembership = req.user.organizations.find(org => org.orgId === req.orgId);
        if (orgMembership && roles.includes(orgMembership.role)) {
            hasRole = true;
        }
        
        // Also check institute roles if institute context exists
        if (!hasRole && req.instituteId) {
            const instMembership = req.user.institutes.find(inst => 
                inst.instituteId === req.instituteId && inst.organizationId === req.orgId
            );
            if (instMembership && roles.includes(instMembership.role)) {
                hasRole = true;
            }
        }
    } else {
        // If no organization context, check across all organizations and institutes
        const orgRoles = req.user.organizations.map(org => org.role);
        const instRoles = req.user.institutes.map(inst => inst.role);
    
        const allRoles = [...orgRoles, ...instRoles];
        hasRole = allRoles.some(role => roles.includes(role));
    }

    if (!hasRole) {
        return res.status(403).json({ message: "Forbidden" });
    }
    
    next();
};
  