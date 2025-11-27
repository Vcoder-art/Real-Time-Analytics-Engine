const { analyticsClient } = require("../grpc/client");

class RustQuery {
  getCountOfEventsByApp(companyId, appId, userId) {
    return new Promise((res, rej) => {
      const grpcRequest = {
        company_id: companyId,
        app_id: appId,
        user_id: userId,
      };

      analyticsClient.GetEventCount(grpcRequest, (err, response) => {
        if (err) {
          console.log("gRPC error:", err);
          return rej("Failed to get count.");
        }
        return res(response);
      });
    });
  }

  getDailyActiveUsers(company_id, appId, days) {
    return new Promise((res, rej) => {
      const grpcRequest = {
        company_id,
        app_id: appId,
        days,
      };

      analyticsClient.GetDailyActiveUsers(grpcRequest, (err, response) => {
        if (err) {
          console.log("gRPC error:", err);
          return rej("Failed to get daily active users.");
        }

        return res(response);
      });
    });
  }

  getTrendingEvents(company_id, appId, days) {
    return new Promise((res, rej) => {
      const grpcRequest = {
        company_id,
        app_id: appId,
        days,
      };

      analyticsClient.GetEventTrends(grpcRequest, (err, response) => {
        if (err) {
          console.log("gRPC error:", err);
          return rej("Failed to get trending events.");
        }
        return res(response);
      });
    });
  }

  getUserSpecificData(company_id, app_id, user_id, days) {
    return new Promise((res, rej) => {
      const grpcRequest = {
        company_id: company_id,
        app_id: app_id,
        user_id: user_id,
        days: days ? Number(days) : 30,
      };

      analyticsClient.GetUserInitialAnalytics(grpcRequest, (err, grpcRes) => {
        if (err) {
          return rej("Internal analytics error");
        }

        const data = grpcRes;
        return res({
          summary: data.summary,
          activityTimeline: { data: data.activity_timeline },
          eventBreakdown: { data: data.event_breakdown },
          recentEvents: { data: data.recent_events },
        });
      });
    });
  }
}

module.exports = { RustQuery };
