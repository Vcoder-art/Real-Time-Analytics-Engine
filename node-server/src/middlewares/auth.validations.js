const jwt = require("jsonwebtoken");
const EmployeeModel = require("../models/employee.model");

/**
 * Middleware: Authenticate company via JWT
 * ------------------------------------------------
 * Expects header: Authorization: Bearer <token>
 * If valid, sets req.companyId = decoded.companyId
 */
async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return res.status(401).json({ msg: "Missing Authorization header" });
    }

    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) {
      return res.status(401).json({ msg: "Invalid token format" });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.companyId) {
      return res.status(401).json({ msg: "Invalid token payload" });
    }

    const user = await EmployeeModel.findOne({ userId: decoded.userId });

    // Attach companyId to request
    req.companyId = decoded.companyId;
    req.user = user;
    next();
  } catch (err) {
    console.error("[Auth Middleware] Token verification failed:", err.message);
    res.status(401).json({ msg: "Unauthorized or token expired" });
  }
}

module.exports = authMiddleware;
