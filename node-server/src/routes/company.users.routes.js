const router = require("express").Router();
const validateApiKey = require("../middlewares/api.key.validations");
const authMiddleware = require("../middlewares/auth.validations")
const { initUser ,listUsersByApp} = require("../controllers/company.users.controller");


router.post("/init-user", validateApiKey, initUser);
router.get("/fetch-users", authMiddleware, listUsersByApp);

module.exports = router;