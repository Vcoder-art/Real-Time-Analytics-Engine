const MailMessage = require("../models/mail.message.model");
const EmployeeModel = require("../models/employee.model");

// sent mail to the users
const sendMail = async (req, res) => {
  try {
    const { subject, body, content } = req.body;
    const companyId = req.companyId;
    const sender = req.user;
    const to = JSON.parse(req.body.to);

    if (!to || !Array.isArray(to) || to.length === 0) {
      return res.status(400).json({ msg: "Recipients required" });
    }

    if (!body) {
      return res.status(400).json({ msg: "Message body required" });
    }

    const employees = await EmployeeModel.find({
      companyId,
      userId: { $in: to },
    }).select("userId name email _id");

    if (employees.length === 0) {
      return res.status(400).json({ msg: "Invalid recipients" });
    }

    //handle attachments
    const attachments = (req.files || []).map((file) => ({
      fileName: file.originalName,
      fileUrl: `/mail-uploads/${file.filename}`,
      mimeType: file.mimetype,
      size: file.size,
    }));

    const mail = await MailMessage.create({
      companyId,
      from: {
        userId: sender.userId,
        name: sender.name,
        email: sender.email,
        docId: sender._id,
      },
      to: employees.map((emp) => {
        return {
          userId: emp.userId,
          name: emp.name,
          email: emp.email,
          docId: emp._id,
        };
      }),

      subject,
      body,
      attachments,
      status: "sent",
      plainText: content,
    });

    return res.json({
      success: true,
      msg: "Mail sent successfully",
      data: mail,
    });
  } catch (err) {
    console.error("Send mail error:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
};

// get Inbox Emails
const getInbox = async (req, res) => {
  try {
    const companyId = req.companyId;
    const userId = req.user.userId;

    let mails = await MailMessage.find({
      companyId,
      "to.userId": userId,
    })
      .sort({ createdAt: -1 })
      .select("-body")
      .lean();

    mails = mails.map((el) => {
      if (el.plainText) {
        el.plainText = el.plainText
          .replace(/[\n\r]+/g, " ") // Replace one or more newlines/returns with a single space
          .trim() // Remove leading/trailing whitespace
          .substring(0, 50); // Take first 50 characters
      } else {
        el.plainText = "";
      }
      return el;
    });

    return res.json({
      success: true,
      data: mails,
    });
  } catch (err) {}
};

// get sent emails
const getSent = async (req, res) => {
  try {
    const companyId = req.companyId;
    const userId = req.user.userId;

    let mails = await MailMessage.find({
      companyId,
      "from.userId": userId,
    })
      .select("to from subject body attachments status readBy createdAt plainText")
      .sort({ createdAt: -1 })
      .lean();

    // Clean and truncate plainText
    mails = mails.map((el) => {
      if (el.plainText) {
        el.plainText = el.plainText
          .replace(/[\n\r]+/g, " ") // Replace one or more newlines/returns with a single space
          .trim() // Remove leading/trailing whitespace
          .substring(0, 50); // Take first 50 characters
      } else {
        el.plainText = "";
      }
      return el;
    });

    res.json({
      msg: "Fetch sent mails successfully",
      success: true,
      data: mails,
    });
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch sent mails" });
  }
};

//Read Mail API (Mark as Read)
const getMailById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const mail = await MailMessage.findById(id);

    if (!mail)
      return res.status(404).json({ msg: "Mail not found", success: false });

    if (!mail.readBy.includes(userId)) {
      mail.readBy.push(userId);
      await mail.save();
    }

    res.json({
      success: true,
      data: mail,
    });
  } catch (err) {
    res.status(500).json({ msg: "Failed to read mail" });
  }
};

module.exports = { sendMail, getInbox, getSent, getMailById };
