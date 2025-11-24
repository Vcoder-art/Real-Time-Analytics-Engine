const router = require("express").Router();
const validateApiKey = require("../middlewares/api.key.validations");
const { initUser } = require("../controllers/company.users.controller");

router.post("/init-user", validateApiKey, initUser);

module.exports = router;