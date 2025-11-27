class WebSocketService {
  constructor() {
    this.ws = null;
    this.callbacks = new Map();
  }

  connect() {
    return new Promise((res, rej) => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN)
        return res("You Already Connected.");

      this.ws = new WebSocket("ws://localhost:4000");
      this.ws.onopen = () => res("WS Connected");

      this.ws.onclose = () => console.log("WS Disconnected");
      this.ws.onerror = (err) => rej("WS Error:", err);

      this.ws.onmessage = (msg) => {
        try {
          const data = JSON.parse(msg.data);
          console.log(data);
          // if(data?.type !== "QUERIED_DATA") {
          //    return console.log(data);
          // }
          //real time messages

          if (data.channel && this.callbacks.has(data.channel)) {
            this.callbacks.get(data.channel)(data);
          }
        } catch (e) {
          console.log("Non JSON:", msg.data);
          console.log("Error", e);
        }
      };
    });
  }

  async subscribe(channel, callback) {
    try {
      await this.connect();
      this.callbacks.set(channel, callback);
      if (this.ws.readyState !== WebSocket.OPEN) {
        await new Promise((resolve) => {
          this.ws.addEventListener("open", resolve, { once: true });
        });
      }
      this.ws.send(JSON.stringify({ action: "subscribe", channel }));
    } catch (Err) {
      console.log(Err);
    }
  }

  unsubscribe(channel) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    this.ws.send(JSON.stringify({ action: "unsubscribe", channel }));
    this.callbacks.delete(channel);
  }
}

export const ws = new WebSocketService();
