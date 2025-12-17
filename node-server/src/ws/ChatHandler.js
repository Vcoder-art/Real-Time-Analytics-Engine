const { redisHelper } = require("../utils/redis-helper");
const MessageModel = require("../models/chat.message.model");

class ChatHandler {
  static async publishChatMessageRs(
    {
      action,
      channel,
      text,
      userRefId,
      userId,
      companyId,
      senderName,
      groupId,
    },
    ws
  ) {
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
        text,
      });

      const chatPayload = {
        actionType: "chat_message",
        channel,
        data: {
          sender: messageDetails.sender,
          text,
          type: messageDetails.type,
          senderName: senderName,
          createdAt: messageDetails.createdAt,
        },
      };

      // Publish to redis so ALL subscribed clients get it
      redisHelper.redisClient.publish(channel, JSON.stringify(chatPayload));
    }
  }

  static async sendTypingEvent(
    channel,
    userId,
    senderName,
    activeConnections,
    state,
    action,
    ws
  ) {
    if (action === "typing") {
      const clients = activeConnections.get(channel);

      if (clients) {
        for (const client of clients) {
          if (client.readyState === client.OPEN && client != ws) {
            client.send(
              JSON.stringify({
                type: "typing",
                channel,
                data: {
                  userId,
                  userName: senderName,
                  state,
                },
              })
            );
          }
        }
      }
    }
  }

  static async publishToGroupWs(parsed, clients) {
    //Detect Chat Message and send directly
    if (parsed.actionType === "chat_message") {
      for (const ws of clients) {
        if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(parsed));
      }
      return true;
    }
  }
}

module.exports = ChatHandler;
