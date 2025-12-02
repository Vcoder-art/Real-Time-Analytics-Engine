const router = require("express").Router();
const {
  getGroups,
  getInitialMessageByGroup,
  fileUploader
} = require("../controllers/team.chat.controller");
const { upload } = require("../utils/chat.uploader");

const authMiddleware = require("../middlewares/auth.validations");


router.get("/get-group", authMiddleware, getGroups);
router.get(
  "/get-initial-messages/:groupId",
  authMiddleware,
  getInitialMessageByGroup
);
router.post(
  "/upload-file",
  authMiddleware,
  upload.single("file"),
  fileUploader
);

module.exports = router;
