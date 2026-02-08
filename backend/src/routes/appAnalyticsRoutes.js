const router = require("express").Router();
const { protect } = require("../middlewares/authMiddleware");
const { requireRole } = require("../middlewares/roleMiddleware");
const { tenantAuth } = require("../middlewares/tenantMiddleware");
const appAnalyticsController = require("../controllers/appAnalyticsController");

const isInstituteAdmin = requireRole(["INSTITUTE_ADMIN", "ORG_ADMIN", "SUPER_ADMIN"]);

router.get("/", protect, tenantAuth, isInstituteAdmin, appAnalyticsController.getInstalledAppsAnalytics);
router.get("/:appId/usage", protect, tenantAuth, isInstituteAdmin, appAnalyticsController.getAppUsageDetails);

module.exports = router;