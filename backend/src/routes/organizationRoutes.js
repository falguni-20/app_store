const router = require("express").Router();
const { protect } = require("../middlewares/authMiddleware");
const { requireRole } = require("../middlewares/roleMiddleware");
const { tenantAuth } = require("../middlewares/tenantMiddleware");
const organizationController = require("../controllers/organizationController");

const canManageOrganization = requireRole(["ORG_ADMIN", "SUPER_ADMIN"]);

router.get("/all", protect, requireRole(["SUPER_ADMIN"]), organizationController.listAllOrganizations);

router.get("/:orgId/installed-apps", protect, tenantAuth, canManageOrganization, organizationController.listInstalledAppsByOrganization);

router.get("/:orgId/institutes", protect, tenantAuth, canManageOrganization, organizationController.listInstitutesByOrganization);
router.post("/:orgId/institutes", protect, tenantAuth, canManageOrganization, organizationController.createInstitute);

router.get("/:orgId/users", protect, tenantAuth, canManageOrganization, organizationController.getUsersInOrganization);
router.post("/:orgId/users/invite", protect, tenantAuth, canManageOrganization, organizationController.inviteUserToOrganization);

module.exports = router;