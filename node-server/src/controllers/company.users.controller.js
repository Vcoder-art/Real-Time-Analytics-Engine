const { generateUserId } = require("../utils/generateId");
const UserModel = require("../models/company.users.model");

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

module.exports = { initUser };
