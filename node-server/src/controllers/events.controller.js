const { analyticsClient } = require("../grpc/client");
const { RustQuery } = require("../rust-query/rust-query");

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
  const { appId, company, days } = req.body;

  if (!appId || !company || !days) {
    return res.status(400).json({ msg: "Missing Fields.", success: false });
  }

  try {
    let query = new RustQuery();
    let data = await query.getDailyActiveUsers(company, appId, days);
    let data2 = await query.getTrendingEvents(company, appId, days);
    let data3 = await query.getCountOfEventsByApp(company, appId);

    const payload = {
      success: true,
      msg: "Fetch successfully initial data.",
      data: {
        dailyActiveUsers: data,
        trendingEvents: data2,
        countOfEventsByApp: data3,
      },
    };

    res.json(payload)
  } catch (err) {
    res.status(500).json({msg:"Failed to fetch initial data.", success: false})
  }
}

module.exports = { saveEvents ,getInitialAggregatedResults};
