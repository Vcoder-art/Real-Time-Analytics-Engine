const { WebSocketServer } = require("ws");
const EventHandler = require("./EventHandler");
const ChatHandler = require("./ChatHandler");

class WebSocketGateway {
  constructor(server, redis) {
    this.wss = new WebSocketServer({ server });

    this.redisSubscriber = redis.redisSubscriber;
    this.redisClient = redis.redisClient;
    this.activeConnections = new Map();
    this.callSockets = new Map();

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
            companyId,
            state
          } = JSON.parse(msg.toString());

          if (action === "subscribe") this.subscribe(ws, channel);
          if (action === "unsubscribe") this.unsubscribe(ws, channel);
          // Rs means redis
          ChatHandler.publishChatMessageRs(
            {
              action,
              channel,
              text,
              companyId,
              groupId,
              userRefId,
              userId,
              senderName,
            },
            ws
          );
          ChatHandler.sendTypingEvent(
            channel,
            userId,
            senderName,
            this.activeConnections,
            state,
            action,
            ws
          );

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
      if (await ChatHandler.publishToGroupWs(parsed, clients)) return;
      EventHandler.getQueriedDataAndPublishToWs(parsed, channel, clients);
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
    if (ws.userId) this.callSockets.delete(ws.userId);

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
