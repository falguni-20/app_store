const router = require("express").Router();
const { protect } = require("../middlewares/authMiddleware");
const { requireRole } = require("../middlewares/roleMiddleware");
const appController = require("../controllers/adminAppController");
const upload = require("../middlewares/uploadMiddleware");
const validate = require("../middlewares/validate");
const parseFormData = require("../middlewares/parseFormData");
const { createAppSchema, updateAppSchema } = require("../validation/appValidation");

const isAdmin = requireRole(["SUPER_ADMIN"]);

router.post("/", protect, isAdmin, upload.single("logo"), parseFormData, validate(createAppSchema), appController.createApp);
router.put("/:id", protect, isAdmin, upload.single("logo"), parseFormData, validate(updateAppSchema), appController.updateApp);
router.delete("/:id", protect, isAdmin, appController.deleteApp);
router.get("/", protect, isAdmin, appController.listAllApps);

module.exports = router;
