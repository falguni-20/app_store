exports.tenantAuth = (req, res, next) => {
    const orgId = Number(req.headers["x-org-id"]);
    const instituteId = Number(req.headers["x-institute-id"]);

    if (!orgId) {
      return res.status(400).json({ message: "X-Org-Id header required" });
    }

    const hasOrgAccess = req.user.organizations.some(
      (org) => org.orgId === orgId
    );
    if (!hasOrgAccess) {
      return res.status(403).json({ message: "Forbidden: No access to this organization" });
    }

    if (instituteId) {
      const hasInstituteAccess = req.user.institutes.some(
        (institute) => institute.instituteId === instituteId
      );
      if (!hasInstituteAccess) {
        return res.status(403).json({ message: "Forbidden: No access to this institute" });
      }
    }

    req.orgId = orgId;
    if (instituteId) {
      req.instituteId = instituteId;
    }
    next();
  };
  