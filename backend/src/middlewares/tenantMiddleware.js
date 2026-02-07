exports.tenantRequired = (req, res, next) => {
    const orgId = Number(req.headers["x-org-id"]);
    const instituteId = Number(req.headers["x-institute-id"]);
  
    if (!orgId || !instituteId) {
      return res.status(400).json({ message: "Tenant headers required" });
    }
  
    req.orgId = orgId;
    req.instituteId = instituteId; 
    next();
  };
  