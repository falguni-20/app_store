const router = require("express").Router();
const ctrl = require("../controllers/authController");

router.post("/login", ctrl.login);
router.post("/refresh-token", ctrl.refreshToken);

module.exports = router;
