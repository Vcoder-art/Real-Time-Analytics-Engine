const router = require("express").Router();
const authMiddleware = require("../middlewares/auth.validations");
const roleMiddleware = require("../middlewares/authorization.validations");
const {
  addEmployee,
  getEmployee,
  activateOrDeactivateEmployee,
} = require("../controllers/employee.controller");

router.post(
  "/add-employee",
  authMiddleware,
  roleMiddleware("admin"),
  addEmployee
);
router.get(
  "/get-employees",
  authMiddleware,
  roleMiddleware("admin"),
  getEmployee
);
router.post(
  "/activate-or-deactivate",
  authMiddleware,
  roleMiddleware("admin"),
  activateOrDeactivateEmployee
);

module.exports = router;
