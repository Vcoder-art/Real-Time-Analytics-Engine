const EmployeeModel = require("../models/employee.model");
const { generateUserId } = require("../utils/generateId");
const { Types } = require("mongoose");
const ChatGroup = require("../models/chat.group.model");

async function addEmployee(req, res) {
  try {
    const { email, name, password } = req.body;

    // ----------- Validation -----------
    if (!email || !name || !password) {
      return res.status(400).json({
        success: false,
        msg: "Email, name, and password are required.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        msg: "Invalid email format.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        msg: "Password must be at least 6 characters.",
      });
    }

    // ----------- Check duplicate email -----------
    const alreadyExisting = await EmployeeModel.findOne({ email })
      .select("_id")
      .lean();

    if (alreadyExisting) {
      return res.status(409).json({
        success: false,
        msg: "Email is already in use.",
      });
    }

    // ----------- Generate UserId -----------
    const userId = generateUserId();
    if (!userId) {
      return res.status(500).json({
        success: false,
        msg: "Failed to generate user ID.",
      });
    }

    const companyId = req.companyId;

    // ----------- Create employee -----------
    const employee = await EmployeeModel.create({
      companyId,
      email,
      name,
      password,
      role: "employee",
      userId,
    });

    let chatGroup = await ChatGroup.findOne({ companyId: req.companyId });
    if (!chatGroup || String(chatGroup.companyId) !== req.companyId)
      return res.status(404).json({ msg: "Group not found", success: false });

    chatGroup.members.push(employee._id);
    await chatGroup.save();

    return res.status(201).json({
      success: true,
      msg: "Employee created successfully.",
      data: {
        id: employee._id,
        email: employee.email,
        name: employee.name,
        role: employee.role,
      },
    });
  } catch (err) {
    console.error("Error creating employee:", err);

    return res.status(500).json({
      success: false,
      msg: "Internal server error while creating employee.",
    });
  }
}

async function getEmployee(req, res) {
  const data = await EmployeeModel.find(
    { companyId: req.companyId },
    { _id: 0, password: 0 }
  );
  return res.json({
    msg: "Fetch employees successfully.",
    success: true,
    employees: data,
  });
}

async function activateOrDeactivateEmployee(req, res) {
  const { employeeId, status } = req.body;

  if (!employeeId) {
    return res
      .status(400)
      .json({ msg: "Invalid Employee id.", success: false });
  }

  if (status !== "activate" && status !== "deactivate") {
    return res
      .status(400)
      .json({ msg: "Invalid status code.", success: false });
  }

  try {
    const result = status === "activate" ? true : false;
    await EmployeeModel.findOneAndUpdate(
      { userId: employeeId },
      { isActive: result }
    );
    return res.json({ msg: `Employee ${status} successfully.`, success: true });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ msg: "Failed to update employee.", success: false });
  }
}

module.exports = {
  addEmployee,
  getEmployee,
  activateOrDeactivateEmployee,
};
