const router = require("express").Router();
const {registerCompany,login} = require("../controllers/company.controller")

router.post("/register",registerCompany)
router.post("/login",login)

module.exports = router