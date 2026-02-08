const router = require("express").Router();
const { protect } = require("../middlewares/authMiddleware");
const { requireRole } = require("../middlewares/roleMiddleware");
const appController = require("../controllers/appController");

const canViewApps = requireRole(["INSTITUTE_ADMIN", "ORG_ADMIN", "SUPER_ADMIN"]);

router.get("/", protect, canViewApps, appController.listAllApps);

module.exports = router;