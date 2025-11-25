const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    appId: {
      type: String,
      required: true,
      index: true,
    },

    email: { type: String, required: true },
    name: { type: String, required: true },

    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    anonymousIds: { type: [String], default: [] },

    lastActiveAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
