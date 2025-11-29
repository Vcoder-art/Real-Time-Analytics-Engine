const ChatGroupModel = require("../models/chat.group.model");

async function getGroups(req, res) {
  try {
    const companyId = req.companyId;

    const group = await ChatGroupModel.findOne({ companyId })
      .populate("members", "name -_id");  // return only name, remove _id

    return res.json({
      success: true,
      msg: "Group fetched successfully.",
      group
    });
  } catch (err) {
    res.status(500).json({ success: false, msg: "Failed to get group." });
  }
}


module.exports = {getGroups}
