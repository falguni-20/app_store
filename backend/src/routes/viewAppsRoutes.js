const router = require("express").Router();
const { protect } = require("../middlewares/authMiddleware");
const { requireRole } = require("../middlewares/roleMiddleware");
const appController = require("../controllers/appController");

// Allow institute admins, org admins, and super admins to view apps
const canViewApps = requireRole(["INSTITUTE_ADMIN", "ORG_ADMIN", "SUPER_ADMIN"]);

// Get all apps (for institute admins to see what's available to install)
router.get("/", protect, canViewApps, appController.listAllApps);

module.exports = router;