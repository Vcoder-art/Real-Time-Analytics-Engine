const ApiKeyModel = require("../models/api.key.model");
// const { redisSubscriber } = require("../utils/redisSubscriber");

async function getAppChannelsByCompanyId(req, res) {
  try {
    const apps = await ApiKeyModel.find({ company: req.companyId }).select(
      "appId appName key"
    );

    if (!apps.length) {
      return res.status(404).json({
        success: false,
        msg: "No apps found for this company",
      });
    }

    // 🧠 Construct channel identifiers

    const channels = apps.map((app) => ({
      appId: app.appId,
      appName: app.appName,
      channel: `analytics:company:${req.companyId}:app:${app.appId}`,
      apiKey: app.key
    }));

    res.status(200).json({
      success: true,
      channels,
    });
  } catch (err) {
    console.error("Error fetching company channels:", err);
    res.status(500).json({ success: false, msg: "Internal server error" });
  }
}

// async function subscribeApp(req, res) {
//   try {
//     const { appId } = req.body;

//     if (!appId) {
//       return res.status(400).json({ error: "app id is required" });
//     }

//     const app = await ApiKeyModel.findOne({ appId }).select("appId");

//     if (!app) {
//       return res.status(404).json({ error: "App not found." });
//     }

//     const channelName = `analytics:company:${req.companyId}:app:${appId}`;

//     await redisSubscriber.subscribe(channelName, "");

//     return res.json({
//       success: true,
//       message: `Subscribed to channel ${channelName}`,
//     });
//   } catch (err) {
//     console.error("❌ Subscription error:", err);
//     return res.status(500).json({ success: false, error: err.message });
//   }
// }

module.exports = { getAppChannelsByCompanyId };
