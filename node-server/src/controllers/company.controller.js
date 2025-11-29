const CompanyModel = require("../models/company.model.js");
const EmployeeModel = require("../models/employee.model.js");
const { generateUserId } = require("../utils/generateId.js");
const ChatGroup = require("../models/chat.group.model.js");
const jwt = require("jsonwebtoken");

async function registerCompany(req, res) {
  const { name, email, password, phone, address } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Name, email, and password are required" });
  }

  try {
    const existing = await CompanyModel.findOne({ email });

    if (existing) {
      return res.status(400).json({ message: "Company already registered" });
    }

    const company = await CompanyModel.create({
      name,
      email,
      phone,
      address,
    });

    const adminUser = await EmployeeModel.create({
      companyId: company._id,
      email,
      name,
      role: "admin",
      userId: generateUserId(),
      password,
    });

    await ChatGroup.create({
      companyId: company._id,
      members: [adminUser._id],
      meta: {
        companyName: company.name,
      },
    });

    return res.status(201).json({
      message: "Company registered successfully",
      company: {
        id: company._id,
        name: company.name,
        email: company.email,
      },
    });
  } catch (Err) {
    console.error("❌ Registration error:", Err);
    res.status(500).json({ message: "Server error" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password are required" });
    }

    // Check if company exists
    const employee = await EmployeeModel.findOne({ email });
    if (!employee) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Validate password
    const isMatch = await employee.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        companyId: employee.companyId,
        email: employee.email,
        userId: employee.userId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    
    // Respond
    res.json({
      success: true,
      token,
      user: {
        id: employee.userId,
        name: employee.name,
        email: employee.email,
        companyId:employee.companyId
      },
    });
  } catch (err) {
    console.error("Login failed:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
}

module.exports = { registerCompany, login };
