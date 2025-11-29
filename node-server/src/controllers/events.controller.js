const { analyticsClient } = require("../grpc/client");
const { RustQuery } = require("../rust-query/rust-query");
const CompanySettingModel = require("../models/company.settings.model");
const ApiKeyModel = require("../models/api.key.model");

async function saveEvents(req, res) {
  const { events, userid } = req.body;

  if (!Array.isArray(events) || events.length === 0) {
    return res.status(400).json({ msg: "events array is required" });
  }

  const batch = {
    app_id: req.apiKeyDoc.appId,
    company_id: req.company._id.toString(),
    user_id: userid,
    events: events.map((ev) => ({
      event_name: ev.event,
      timestamp: ev.timestamp,
      payload_json: JSON.stringify({ hello: "rust" }),
    })),
  };

  analyticsClient.SaveEvent(batch, (err, response) => {
    if (err) {
      console.log("gRPC error:", err);
      return res
        .status(500)
        .json({ success: false, msg: "Failed to send events" });
    }
    console.log(response);

    return res.status(200).json({
      done: true,
    });
  });

  // res.status(200).send({ status: "ok" });
}

async function getInitialAggregatedResults(req, res) {
  const { appId } = req.body;

  if (!appId) {
    return res.status(400).json({ msg: "Missing App ID.", success: false });
  }

  let companyId = req.companyId;

  try {
    const isValidApp = await ApiKeyModel.findOne({
      company: companyId,
      appId,
    }).select("_id");

    if (!isValidApp) {
      return res.status(400).json({ msg: "Invalid app ID." });
    }

    const companySettings = await CompanySettingModel.findOne({ companyId });
    let days = 10;
    if (companySettings || companySettings?.retentionDays) {
      days = companySettings?.retentionDays;
    }

    let query = new RustQuery();
    let data = await query.getDailyActiveUsers(companyId, appId, days);
    let data2 = await query.getTrendingEvents(companyId, appId, days);
    let data3 = await query.getCountOfEventsByApp(companyId, appId);

    const payload = {
      success: true,
      msg: "Fetch successfully initial data.",
      data: {
        dailyActiveUsers: data,
        trendingEvents: data2,
        countOfEventsByApp: data3,
      },
    };

    res.json(payload);
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ msg: "Failed to fetch initial data.", success: false });
  }
}

module.exports = { saveEvents, getInitialAggregatedResults };
