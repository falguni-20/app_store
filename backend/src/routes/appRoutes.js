const router = require("express").Router();
const appController = require("../controllers/appController");
const { protect } = require("../middlewares/authMiddleware");
const { tenantRequired } = require("../middlewares/tenantMiddleware");
const { launchApp } = require("../controllers/appController");

router.get("/", protect, tenantRequired, appController.listApps);

router.get("/:id", protect, tenantRequired, appController.getApp);

router.get("/:appId/launch", protect, tenantRequired, launchApp);


module.exports = router;
