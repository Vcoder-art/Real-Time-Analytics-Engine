const mongoose = require("mongoose");

const AttachmentSchema = new mongoose.Schema(
  {
    fileName: String,
    fileUrl: String,
    mimeType: String,
    size: Number,
  },
  { _id: false }
);

const MailMessageSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    from: {
      docId: mongoose.Schema.Types.ObjectId,
      userId: String,
      name: String,
      email: String,
    },

    to: [
      {
        docId: mongoose.Schema.Types.ObjectId,
        userId: String,
        name: String,
        email: String,
      },
    ],

    subject: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    body: {
      type: String, // HTML content
      required: true,
    },

    attachments: [AttachmentSchema],

    status: {
      type: String,
      enum: ["sent", "draft"],
      default: "sent",
    },

    readBy: {
      type: [String], // userIds
      default: [],
    },
  },
  { timestamps: true }
);

MailMessageSchema.index({ companyId: 1, "to.docId": 1 });
MailMessageSchema.index({ companyId: 1, "from.docId": 1 });

module.exports = mongoose.model("MailMessage", MailMessageSchema);
