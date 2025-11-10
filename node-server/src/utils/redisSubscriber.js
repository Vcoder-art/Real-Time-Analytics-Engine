const { Redis } = require("ioredis");
const {RustQuery} = require("../rust-query/rust-query")

class RedisSubscriber {
  constructor() {
    this.subscriber = new Redis({
      host: "127.0.0.1",
      port: 6379,
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });

    this.subscriber.on("connect", () => {
      console.log("✅ Redis subscriber connected");
    });

    this.subscriber.on("error", (err) => {
      console.error("❌ Redis connection error:", err);
    });

    this.activeChannels = new Set();
  }

  async subscribe(channelName, io) {
    if (this.activeChannels.has(channelName)) {
      console.log(`⚠️ Already subscribed to ${channelName}`);
      return;
    }

    this.activeChannels.add(channelName);

    this.subscriber.subscribe(channelName, (err, count) => {
      if (err) {
        console.error("❌ Failed to subscribe:", err);
        return;
      }

      console.log(
        `📡 Subscribed to Redis channel: ${channelName} (${count} total)`
      );
    });

    this.subscriber.on("message", async (channel, message) => {
      if (channel !== channelName) return;  // filter
      try {
        const data = JSON.parse(message);
        const query = new RustQuery();
        const response = await query.getCountOfEventsByApp(data.company_id,data.app_id);
        const response2 = await query.getDailyActiveUsers(data.company_id,data.app_id,5);
        const response3 = await query.getTrendingEvents(data.company_id,data.app_id,5);

        console.log("event   count",response);
        console.log("daily active users",response2);
        console.log("Get Trending Events",response3);

        // todo 
        // Publish all aggregated data to the connected websockets 
      } catch (err) {
        console.error("Error parsing Redis message:", err);
      }
    });
  }
}

const redisSubscriber = new RedisSubscriber();
module.exports = { redisSubscriber };
