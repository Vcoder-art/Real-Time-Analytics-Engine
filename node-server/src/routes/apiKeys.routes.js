const router = require("express").Router();
const {createApiKey,revokeApiKey} = require("../controllers/api.key.controller")
const authMiddleware = require("../middlewares/auth.validations")

router.post("/create-api-key",authMiddleware,createApiKey);
router.get("/revoke-api-key/:key",authMiddleware,revokeApiKey);

module.exports = router