const router = require("express").Router();
const validateApiKey = require("../middlewares/api.key.validations");
const authMiddleware = require("../middlewares/auth.validations")
const { initUser ,listUsersByApp, getInitialSnapshot} = require("../controllers/company.users.controller");


router.post("/init-user", validateApiKey, initUser);
router.get("/fetch-users", authMiddleware, listUsersByApp);
router.get("/:userId/initial-snapshot",authMiddleware,getInitialSnapshot);

module.exports = router;