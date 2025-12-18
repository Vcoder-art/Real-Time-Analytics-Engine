const express = require("express");
const router = express.Router();
const {
  sendMail,
  getInbox,
  getSent,
  getMailById,
} = require("../controllers/mail.controller");
const auth = require("../middlewares/auth.validations");
const { uploadMailAttachments } = require("../utils/mail.uploader");

router.post(
  "/send",
  auth,
  uploadMailAttachments.array("attachments", 5),
  sendMail
);
router.get("/inbox", auth, getInbox);
router.get("/sent", auth, getSent);
router.get("/:id", auth, getMailById);

module.exports = router;
