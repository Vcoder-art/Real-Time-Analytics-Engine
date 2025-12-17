class CallHandler {
  async send(parsed, ws, activeConnections) {
    const { action } = parsed;

    // new: identify handshake - client must send once after connect
    // { action: "identify", userId: "user_abc" }

    if (action === "identify" && parsed.userId) {
      ws.userId = parsed.userId;
      activeConnections.set(parsed.userId, ws);
      ws.send(JSON.stringify({ type: "identified", userId: parsed.userId }));
      return;
    }

    if (
      action === "call-offer" ||
      action === "call-answer" ||
      action === "ice-candidate" ||
      action === "call-end" ||
      action === "call-reject"
    ) {
      const { to } = parsed;

      if (!to) {
        return ws.send(
          JSON.stringify({ type: "error", msg: "Missing 'to' field" })
        );
      }

      const targetWs = activeConnections.get(to);
      if (!targetWs || targetWs.readyState !== targetWs.OPEN) {
        return ws.send(JSON.stringify({ type: "call_unreachable", to }));
      }

      // forward the message, keep senderId so recipient knows who
      const forward = {
        ...parsed,
        from: ws.userId || null, // may be undefined if identify not called
      };
      targetWs.send(JSON.stringify(forward));
      return;
    }
  }
}
