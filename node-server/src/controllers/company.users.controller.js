const { generateUserId } = require("../utils/generateId");
const UserModel = require("../models/company-users.model");

const initUser = async (req, res) => {
  const { email, name } = req.body;
  let apiKeyDoc = req.apiKeyDoc;

  const companyId = apiKeyDoc.company;
  const appId = apiKeyDoc.appId;

  try {
    if (!email || !name)
      return res
        .status(400)
        .json({ msg: "Email and Name required.", success: false });

    let user = await UserModel.findOne({ companyId, appId, email });

    // if user already exist
    if (user) {
      user.lastActiveAt = new Date();

      await user.save();

      return res.json({
        success: true,
        userId: user.userId,
        msg: "Existing User",
      });
    }

    // create new user
    const newUser = await UserModel.create({
      companyId,
      appId,
      email,
      name,
      userId: generateUserId(),
    });

    return res.json({
      success: true,
      userId: newUser.userId,
      message: "New user created.",
    });
  } catch (err) {
    console.error("User init error:", err);
    res.status(500).json({ msg: "Internal Server Error", success: false });
  }
};

const listUsersByApp = async (req, res) => {
  const { appId } = req.query;

  if (!appId) {
    return res.status(400).json({
      success: false,
      msg: "AppId is required.",
    });
  }

  try {
    const usersList = await UserModel.find({ appId }).select("email name userId lastActiveAt createdAt");

    if (usersList.length < 1) {
      return res
        .status(404)
        .json({ success: false, msg: "Users not found on this app." });
    }

    const payload = {
      msg: "Successfully fetch users.",
      usersList
    }

    return res.json(payload)
     
  } catch (err) {
    res.status(500).json({msg:"Failed to fetch users."})
  }
};

module.exports = { initUser,listUsersByApp };
