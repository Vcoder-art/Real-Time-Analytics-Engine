const router = require("express").Router();
const {
  getGroups,
  getInitialMessageByGroup,
} = require("../controllers/team.chat.controller");
const authMiddleware = require("../middlewares/auth.validations");

router.get("/get-group", authMiddleware, getGroups);
router.get("/get-initial-messages/:groupId", authMiddleware, getInitialMessageByGroup);
module.exports = router;
