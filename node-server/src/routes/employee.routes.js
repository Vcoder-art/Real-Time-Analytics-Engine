const router = require("express").Router();
const authMiddleware = require("../middlewares/auth.validations");
const roleMiddleware = require("../middlewares/authorization.validations");
const {
  addEmployee,
  getEmployee,
} = require("../controllers/employee.controller");

router.post("/add-employee", authMiddleware, roleMiddleware("admin"), addEmployee);
router.get("/get-employees",authMiddleware,roleMiddleware("admin"),getEmployee)

module.exports = router;