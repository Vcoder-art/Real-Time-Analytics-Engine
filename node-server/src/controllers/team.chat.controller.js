const ChatGroupModel = require("../models/chat.group.model");
const MessageModel = require("../models/chat.message.model");
const mongoose = require("mongoose");


async function getGroups(req, res) {
  try {
    const companyId = req.companyId;

    const group = await ChatGroupModel.findOne({ companyId }).populate(
      "members",
      "name -_id"
    ); // return only name, remove _id

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

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
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


module.exports = { getGroups, getInitialMessageByGroup };
