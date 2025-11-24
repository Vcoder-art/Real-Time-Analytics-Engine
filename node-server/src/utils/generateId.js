const crypto = require("crypto");

function generateUserId() {
  return "user_" + crypto.randomBytes(8).toString("hex");
}

module.exports = { generateUserId };
