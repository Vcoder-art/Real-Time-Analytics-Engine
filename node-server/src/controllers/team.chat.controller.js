const ChatGroupModel = require("../models/chat.group.model");
const MessageModel = require("../models/chat.message.model");
const { redisHelper } = require("../utils/redis-helper");
const { ObjectId } = require("mongoose").Types;

async function getGroups(req, res) {
  try {
    const companyId = req.companyId;

    const group = await ChatGroupModel.findOne({ companyId })
      .populate("members", "name -_id")
      .lean(); // return only name, remove _id

    group.channel = `chat:group:${group._id}`;

    return res.json({
      success: true,
      msg: "Group fetched successfully.",
      group,
    });
  } catch (err) {
    res.status(500).json({ success: false, msg: "Failed to get group." });
  }
}

async function getInitialMessageByGroup(req, res) {
  try {
    const { groupId } = req.params;

    if (!groupId) {
      return res.status(400).json({
        success: false,
        msg: "Group ID is required.",
      });
    }

    if (!ObjectId.isValid(groupId)) {
      return res.status(400).json({
        success: false,
        msg: "Invalid Group ID format.",
      });
    }

    const messages = await MessageModel.find(
      { groupId },
      {
        text: 1,
        sender: 1,
        senderName: 1,
        createdAt: 1,
        fileUrl: 1,
        fileName: 1,
        fileSize: 1,
        type: 1,
        _id: 0,
      }
    )
      .sort({ createdAt: 1 }) // oldest first → ideal for initial chat load
      .lean(); // improves performance (no Mongoose overhead)

    return res.json({
      success: true,
      msg: "Messages fetched successfully.",
      data: messages,
    });
  } catch (err) {
    console.error("Failed to load initial messages:", err);

    return res.status(500).json({
      success: false,
      msg: "Internal server error while fetching messages.",
    });
  }
}

async function fileUploader(req, res) {
  const { groupId, sender, senderName, senderUserId } = req.body;

  const companyId = req.companyId;

  if (
    !ObjectId.isValid(groupId) ||
    !ObjectId.isValid(sender) ||
    !senderName ||
    !senderUserId
  ) {
    return res.status(400).json({
      msg: "All fields are required.",
      success: false,
    });
  }

  try {
    if (!req.file) {
      return res.status(400).json({ success: false, msg: "No file uploaded" });
    }

    const fileMessage = await MessageModel.create({
      companyId,
      groupId,
      sender,
      senderName,
      text: "placeholder",
      type: "file",
      senderUserId,
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      fileSize: req.file.size,
    });

    const fileData = {
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      sender,
      senderName,
      groupId,
      type: "file",
      createdAt: fileMessage.createdAt,
    };

    const channel = `chat:group:${groupId}`;

    const chatPayload = {
      actionType: "chat_message",
      channel,
      data: fileData,
    };

    redisHelper.redisClient.publish(channel, JSON.stringify(chatPayload));

    return res.json({
      success: true,
      msg: "File uploaded",
      data: fileData,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Upload failed" });
  }
}

module.exports = { getGroups, getInitialMessageByGroup, fileUploader };
