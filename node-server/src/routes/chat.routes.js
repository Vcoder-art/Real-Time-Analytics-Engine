const router = require("express").Router();
const { getGroups } = require("../controllers/team.chat.controller");
const authMiddleware = require("../middlewares/auth.validations");

router.get("/get-group", authMiddleware, getGroups);
module.exports = router;