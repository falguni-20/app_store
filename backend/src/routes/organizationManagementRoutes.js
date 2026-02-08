const router = require("express").Router();
const { protect } = require("../middlewares/authMiddleware");
const { requireRole } = require("../middlewares/roleMiddleware");
const organizationManagementController = require("../controllers/organizationManagementController");

const isSuperAdmin = requireRole(["SUPER_ADMIN"]);

// Super admin only routes
router.get("/", protect, isSuperAdmin, organizationManagementController.getAllOrganizations);
router.post("/", protect, isSuperAdmin, organizationManagementController.createOrganization);
router.put("/:orgId", protect, isSuperAdmin, organizationManagementController.updateOrganization);
router.delete("/:orgId", protect, isSuperAdmin, organizationManagementController.deleteOrganization);

module.exports = router;