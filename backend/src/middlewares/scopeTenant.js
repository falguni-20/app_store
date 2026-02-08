const { runWithTenant } = require("../config/db");

const scopeTenant = (req, res, next) => {
  const orgId = Number(req.headers["x-org-id"]);
  const instituteId = Number(req.headers["x-institute-id"]);

  if (!orgId || !instituteId) {
    return next();
  }

  runWithTenant(instituteId, orgId, () => next());
};

module.exports = scopeTenant;
