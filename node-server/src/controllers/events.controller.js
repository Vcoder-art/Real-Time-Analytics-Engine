const { analyticsClient } = require("../grpc/client");

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
      payload_json: JSON.stringify({hello:"rust"}),
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

module.exports = { saveEvents };
