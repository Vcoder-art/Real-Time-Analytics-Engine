const { Redis } = require("ioredis");

class RedisHelper {
  constructor() {
    this.redisSubscriber = new Redis({ host: "127.0.0.1", port: 6379 });
    this.redisClient = new Redis({ host: "127.0.0.1", port: 6379 });
  }
}

module.exports = { redisHelper: new RedisHelper() };
