exports.tenantAuth = (req, res, next) => {
    const orgId = Number(req.headers["x-org-id"]);
    const instituteId = Number(req.headers["x-institute-id"]);
  
    if (!orgId || !instituteId) {
      return res.status(400).json({ message: "Tenant headers required" });
    }
  
    // Check if user has membership in the requested organization
    const hasOrgAccess = req.user.organizations.some(
      (org) => org.orgId === orgId
    );
    if (!hasOrgAccess) {
      return res.status(403).json({ message: "Forbidden: No access to this organization" });
    }
  
    // Check if user has membership in the requested institute
    const hasInstituteAccess = req.user.institutes.some(
      (institute) => institute.instituteId === instituteId
    );
    if (!hasInstituteAccess) {
      return res.status(403).json({ message: "Forbidden: No access to this institute" });
    }
  
    req.orgId = orgId;
    req.instituteId = instituteId;
    next();
  };
  