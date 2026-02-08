const router = require("express").Router();
const { protect } = require("../middlewares/authMiddleware");
const { requireRole } = require("../middlewares/roleMiddleware");
const { tenantAuth } = require("../middlewares/tenantMiddleware");
const organizationController = require("../controllers/organizationController");

const canManageOrganization = requireRole(["ORG_ADMIN", "SUPER_ADMIN"]);

router.get("/:orgId/institutes", protect, tenantAuth, canManageOrganization, organizationController.listInstitutesByOrganization);
router.post("/:orgId/institutes", protect, tenantAuth, canManageOrganization, organizationController.createInstitute);

// New routes for user management
router.get("/:orgId/users", protect, tenantAuth, canManageOrganization, organizationController.getUsersInOrganization);
router.post("/:orgId/users/invite", protect, tenantAuth, canManageOrganization, organizationController.inviteUserToOrganization);

module.exports = router;