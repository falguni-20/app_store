const router = require("express").Router();
const ctrl = require("../controllers/authController");

router.post("/login", ctrl.login);
router.post("/refresh-token", ctrl.refreshToken); // New route for token refresh

module.exports = router;
