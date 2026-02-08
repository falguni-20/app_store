const router = require("express").Router();
const { protect } = require("../middlewares/authMiddleware");
const { requireRole } = require("../middlewares/roleMiddleware");
const { tenantAuth } = require("../middlewares/tenantMiddleware");
const instituteAppController = require("../controllers/instituteAppController");

const isInstituteAdmin = requireRole(["INSTITUTE_ADMIN", "ORG_ADMIN", "SUPER_ADMIN"]);

router.post("/install", protect, tenantAuth, isInstituteAdmin, instituteAppController.installApp);
router.put("/:appId/configure", protect, tenantAuth, isInstituteAdmin, instituteAppController.configureApp);
router.delete("/:appId/uninstall", protect, tenantAuth, isInstituteAdmin, instituteAppController.uninstallApp);
router.patch("/:appId/status", protect, tenantAuth, isInstituteAdmin, instituteAppController.toggleAppStatus);

module.exports = router;
