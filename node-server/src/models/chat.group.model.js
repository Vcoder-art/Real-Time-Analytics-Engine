const mongoose = require("mongoose");


const ChatGroupSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
  groupName: { type: String, default: "Team Chat" },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "Employee" }],
  meta: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

ChatGroupSchema.index({ companyId: 1 });

module.exports = mongoose.model("ChatGroup", ChatGroupSchema);