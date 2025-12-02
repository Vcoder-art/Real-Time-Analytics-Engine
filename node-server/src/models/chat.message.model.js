const mongoose = require("mongoose");

const ChatMessageSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "ChatGroup", required: true, index: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
  senderUserId: { type: String }, // analytics user id for quick reference
  senderName:{type:String,required: true},
  text: { type: String, required: true },
  deleted: { type: Boolean, default: false },
  type: {type:String,enum:["text","file"],default:"text"},
  fileUrl: {type:String},
  fileName: {type:String},
  fileSize: {type:String},
  meta: { type: mongoose.Schema.Types.Mixed, default: {} },

}, { timestamps: true });

// Common query patterns
ChatMessageSchema.index({ groupId: 1, createdAt: -1 });
ChatMessageSchema.index({ companyId: 1, createdAt: -1 });

module.exports = mongoose.model("ChatMessage", ChatMessageSchema);