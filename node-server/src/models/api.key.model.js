const mongoose = require("mongoose");
const crypto = require("crypto");

const apiKeySchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    appId: { type: String, required: true },
    appName: { type: String, required: true },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    scope: {
      type: String,
      enum: ["sdk", "admin"],
      default: "sdk",
    },
    revoked: { type: Boolean, default: false },
    revokedAt: { type: Date },
    expiresAt: { type: Date },
    lastUsedAt: { type: Date },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

// Static method to generate a secure API key
apiKeySchema.statics.generateKey = function (prefix = "pk_") {
  const token = crypto.randomBytes(32).toString("hex");
  return `${prefix}${token}`;
};

// Optional helper: revoke a key
apiKeySchema.methods.revoke = async function () {
  this.revoked = true;
  this.revokedAt = new Date();
  await this.save();
};

const ApiKeyModel = mongoose.model("ApiKey", apiKeySchema);
module.exports = ApiKeyModel;