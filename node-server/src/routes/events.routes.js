const Router = require("express").Router();
const {saveEvents} = require("../controllers/events.controller")
const validateApiKey = require("../middlewares/api.key.validations")

Router.post("/save-events",validateApiKey,saveEvents)


module.exports = Router;