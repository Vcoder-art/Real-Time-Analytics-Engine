const CompanySettingModel = require("../models/company.settings.model");
const { RustQuery } = require("../rust-query/rust-query");

class EventHandler {
   static async getQueriedDataAndPublishToWs(parsed, channel, clients) {
      console.log("that data",parsed)
      
      const { app_id, company_id, user_id } = parsed;
      let query = new RustQuery();
      let data = null;

      if (channel.includes("user")) {
        const userSpecificData = await query.getUserSpecificData(
          company_id,
          app_id,
          user_id
        );

        data = {
          type: "QUERIED_DATA",
          channel,
          data: userSpecificData,
        };
      } else {
        let companySettings = await CompanySettingModel.findOne({
          companyId: company_id,
        }).select("retentionDays");

        let days = 10;

        if (companySettings || companySettings?.retentionDays) {
          days = companySettings?.retentionDays;
        }

        let activeUsers = await query.getDailyActiveUsers(
          company_id,
          app_id,
          days
        );
        let trendingEvents = await query.getTrendingEvents(
          company_id,
          app_id,
          days
        );
        let countOfEvents = await query.getCountOfEventsByApp(
          company_id,
          app_id
        );

        data = {
          type: "QUERIED_DATA",
          channel,
          data: {
            dailyActiveUsers: activeUsers,
            trendingEvents: trendingEvents,
            countOfEventsByApp: countOfEvents,
          },
        };
      }

      for (const ws of clients) {
        if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(data));
      }
    }
}

module.exports = EventHandler;