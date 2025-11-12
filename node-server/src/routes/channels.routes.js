const Router = require("express").Router();
const {getAppChannelsByCompanyId,subscribeApp} = require("../controllers/channel.controller")
const authMiddleware = require("../middlewares/auth.validations")

Router.get("/get-app-channels",authMiddleware, getAppChannelsByCompanyId)
// Router.post("/subscribe-app-channel",authMiddleware,subscribeApp)
module.exports = Router;