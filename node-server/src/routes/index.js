const router = require("express").Router();


router.use("/auth",require("./auth.routes"));
router.use("/api-keys",require("./apiKeys.routes"));
router.use("/events",require("./events.routes"));
router.use("/channels",require("./channels.routes"));
router.use("/settings",require("./company.settings.routes"));
router.use("/company-users",require("./company.users.routes"));
router.use("/employee",require("./employee.routes"));
router.use("/chat",require("./chat.routes"))
router.use("/mail",require("./mail.routes"))
module.exports = router
