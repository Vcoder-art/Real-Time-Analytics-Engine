const { WebSocketServer } = require("ws");
const { RustQuery } = require("../rust-query/rust-query");
const CompanySettingModel = require("../models/company.settings.model");
const MessageModel = require("../models/chat.message.model")
class WebSocketGateway {
  constructor(server,redis) {
    this.wss = new WebSocketServer({ server });

    this.redisSubscriber = redis.redisSubscriber;
    this.redisClient = redis.redisClient;
    this.activeConnections = new Map();

    this.#setup();
  }

  async #setup() {
    // Recover subscriptions on startup
    await this.#restoreSubscriptions();

    this.wss.on("connection", (ws) => {
      console.log("🟢 Client connected");

      ws.on("message", async (msg) => {
        try {
          const { 
            action, 
            channel, 
            text, 
            senderName, 
            groupId,
            userRefId,
            userId,
            companyId
          } = JSON.parse(msg.toString());

          if (action === "subscribe") this.subscribe(ws, channel);
          if (action === "unsubscribe") this.unsubscribe(ws, channel);

          if (action === "chat_message") {
            if (!channel || !text) {
              return ws.send(
                JSON.stringify({ type: "error", msg: "Invalid chat message." })
              );
            }
            
            const messageDetails = await MessageModel.create({
              companyId,
              groupId,
              sender: userRefId,
              senderUserId: userId,
              senderName,
              text
            })

            const chatPayload = {
              type: "chat_message",
              channel,
              data: {
                sender:messageDetails.sender,
                text,
                senderName: senderName,
                createdAt: messageDetails.createdAt,
              },
            };
            
            // Publish to redis so ALL subscribed clients get it
            this.redisClient.publish(channel, JSON.stringify(chatPayload));

          }
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

      let parsed = null;
      try {
        parsed = JSON.parse(message.toString());
      } catch (_) {
        parsed = { raw: message };
      }

      //Detect Chat Message and send directly
      if (parsed.actionType === "chat_message") {
        for (const ws of clients) {
          if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(parsed));
        }
        return;
      }

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
    console.log("channels", channels);
    for (const channel of channels) {
      this.activeConnections.set(channel, new Set());
      await this.redisSubscriber.subscribe(channel);
      console.log(`♻️ Restored subscription to ${channel}`);
    }
  }
}

module.exports = { WebSocketGateway };
