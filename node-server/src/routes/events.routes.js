const Router = require("express").Router();
const {saveEvents,getInitialAggregatedResults} = require("../controllers/events.controller")
const validateApiKey = require("../middlewares/api.key.validations")
const authMiddleware= require("../middlewares/auth.validations")

Router.post("/save-events",validateApiKey,saveEvents)
Router.post("/get-initial-aggregated-result",authMiddleware,getInitialAggregatedResults)

module.exports = Router;