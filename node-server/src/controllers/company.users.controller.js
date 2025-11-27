const { generateUserId } = require("../utils/generateId");
const UserModel = require("../models/company-users.model");
const { analyticsClient } = require("../grpc/client");
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
    const usersList = await UserModel.aggregate([
      {
        $match: { appId }, // or { appId: appId }
      },
      {
        $project: {
          _id: 0,
          email: 1,
          name: 1,
          userId: 1,
          lastActiveAt: 1,
          createdAt: 1,
          channel: {
            $concat: [
              "analytics:company:",
              { $toString: "$companyId" },
              ":app:",
              { $toString: "$appId" },
              ":user:",
              { $toString: "$userId" }, // convert userId field to string if needed
            ],
          },
        },
      },
    ]);


    if (usersList.length < 1) {
      return res
        .status(404)
        .json({ success: false, msg: "Users not found on this app." });
    }

    const payload = {
      msg: "Successfully fetch users.",
      usersList,
    };

    return res.json(payload);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch users." });
  }
};

const getInitialSnapshot = async (req, res) => {
  const { userId } = req.params;
  const { appId, days } = req.query;
  const companyId = req.companyId; // from JWT

  if (!appId) {
    return res.status(400).json({ success: false, msg: "appId is required" });
  }

  const grpcRequest = {
    company_id: companyId,
    app_id: appId,
    user_id: userId,
    days: days ? Number(days) : 30,
  };

  analyticsClient.GetUserInitialAnalytics(grpcRequest, (err, grpcRes) => {
    if (err) {
      console.error("gRPC GetUserInitialAnalytics error:", err);
      return res
        .status(500)
        .json({ success: false, msg: "Internal analytics error" });
    }

    const data = grpcRes;
    return res.json({
      success: true,
      msg: "Successfully fetched user analytics.",
      data: {
        summary: data.summary,
        activityTimeline: { data: data.activity_timeline },
        eventBreakdown: { data: data.event_breakdown },
        recentEvents: { data: data.recent_events },
      },
    });
  });
};

module.exports = { initUser, listUsersByApp, getInitialSnapshot };
