const Router = require("express").Router();
const authMiddleware = require("../middlewares/auth.validations");
const {
  getCompanySettings,
  settingUpdate,
} = require("../controllers/company.settings.controller");

Router.get("/get-settings", authMiddleware, getCompanySettings);
Router.post("/update-settings", authMiddleware, settingUpdate);

module.exports = Router;