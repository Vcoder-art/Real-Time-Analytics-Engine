const { WebSocketServer } = require("ws");
const { Redis } = require("ioredis");
const { RustQuery } = require("../rust-query/rust-query");
const CompanySettingModel = require("../models/company.settings.model")

class WebSocketGateway {
  constructor(server) {
    this.wss = new WebSocketServer({ server });

    this.redisSubscriber = new Redis({ host: "127.0.0.1", port: 6379 });
    this.redisClient = new Redis({ host: "127.0.0.1", port: 6379 });
    this.activeConnections = new Map();

    this.#setup();
  }

  async #setup() {
    // Recover subscriptions on startup
    await this.#restoreSubscriptions();

    this.wss.on("connection", (ws) => {
      console.log("🟢 Client connected");

      ws.on("message", (msg) => {
        try {
          const { action, channel } = JSON.parse(msg.toString());
          if (action === "subscribe") this.subscribe(ws, channel);
          if (action === "unsubscribe") this.unsubscribe(ws, channel);
        } catch (err) {
          console.error("Invalid message:", err);
        }
      });

      ws.on("close", () => this.#cleanup(ws));
    });

    // Redis message listener
    this.redisSubscriber.on("message", async (channel, message) => {
      const clients = this.activeConnections.get(channel);
      if (!clients) return;
      
      const { app_id, company_id, user_id } = JSON.parse(message.toString());
      
      let companySettings = await CompanySettingModel.findOne({companyId:company_id}).select("retentionDays");
      let days = companySettings.retentionDays || 10;
      
      let query = new RustQuery();
      let data = await query.getDailyActiveUsers(company_id, app_id, days);
      let data2 = await query.getTrendingEvents(company_id, app_id, days);
      let data3 = await query.getCountOfEventsByApp(company_id, app_id);

      const response = {
        type: "QUERIED_DATA",
        channel,
        data: {
          dailyActiveUsers: data,
          trendingEvents: data2,
          countOfEventsByApp: data3,
        },
      };

      for (const ws of clients) {
        if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(response));
      }
    });
  }

  async subscribe(ws, channel) {
    if (!this.activeConnections.has(channel)) {
      this.activeConnections.set(channel, new Set());
      await this.redisSubscriber.subscribe(channel);
      await this.redisClient.sadd("active_channels", channel);
      console.log(`✅ Subscribed Redis to: ${channel}`);
    }

    const clients = this.activeConnections.get(channel);

    // Check if this client is already subscribed
    if (clients.has(ws)) {
      ws.send(
        JSON.stringify({
          type: "already_subscribed",
          channel,
          message: `Already subscribed to ${channel}`,
        })
      );
      return;
    }

    // Otherwise, add it and confirm
    clients.add(ws);
    ws.send(
      JSON.stringify({
        type: "subscribed",
        channel,
        message: `Successfully subscribed to ${channel}`,
      })
    );
  }

  async unsubscribe(ws, channel) {
    const clients = this.activeConnections.get(channel);
    if (!clients) return;

    clients.delete(ws);

    if (clients.size === 0) {
      this.activeConnections.delete(channel);
      await this.redisSubscriber.unsubscribe(channel);
      await this.redisClient.srem("active_channels", channel);
      console.log(`❌ Unsubscribed Redis from: ${channel}`);
    }
    ws.send(JSON.stringify({ type: "unsubscribed", channel }));
  }

  async #cleanup(ws) {
    for (const [channel, clients] of this.activeConnections.entries()) {
      if (clients.has(ws)) {
        clients.delete(ws);
        if (clients.size === 0) {
          await this.redisSubscriber.unsubscribe(channel);
          await this.redisClient.srem("active_channels", channel);
          this.activeConnections.delete(channel);
        }
      }
    }
    console.log("🔴 Client disconnected");
  }

  async #restoreSubscriptions() {
    const channels = await this.redisClient.smembers("active_channels");
    for (const channel of channels) {
      this.activeConnections.set(channel, new Set());
      await this.redisSubscriber.subscribe(channel);
      console.log(`♻️ Restored subscription to ${channel}`);
    }
  }
}

module.exports = { WebSocketGateway };
