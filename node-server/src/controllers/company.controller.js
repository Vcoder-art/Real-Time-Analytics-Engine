const CompanyModel = require("../models/company.model.js");
const jwt = require("jsonwebtoken")

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
      password,
      phone,
      address,
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
    console.error("❌ Registration error:", err);
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
    const company = await CompanyModel.findOne({ email });
    if (!company) {
      return res.status(404).json({ msg: "Company not found" });
    }

    // Validate password
    const isMatch = await company.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { companyId: company._id, name: company.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Respond
    res.json({
      success: true,
      token,
      company: {
        id: company._id,
        name: company.name,
        email: company.email,
      },
    });
  } catch (err) {
    console.error("Login failed:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
}

module.exports = { registerCompany,login };
