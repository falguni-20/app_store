const router = require("express").Router();
const appController = require("../controllers/appController");
const { protect } = require("../middlewares/authMiddleware");
const { tenantAuth } = require("../middlewares/tenantMiddleware");
const { launchApp } = require("../controllers/appController");

router.get("/", protect, tenantAuth, appController.listApps);

router.get("/:id", protect, tenantAuth, appController.getApp);
router.get("/details/:appId", protect, appController.getAppDetail);

router.get("/:appId/launch", protect, tenantAuth, launchApp);


module.exports = router;
