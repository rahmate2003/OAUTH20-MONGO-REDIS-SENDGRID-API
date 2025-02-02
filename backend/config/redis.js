// config/redis.js
const { createClient } = require("redis");
require("dotenv").config();

const redisClient = createClient({
  url: process.env.REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 5) { 
        console.error("Redis: Failed to connect after 5 attempts. Stopping retries.");
        return false;
      }
      console.warn(`Redis: Connection failed. Retrying (${retries})...`);
      return Math.min(retries * 500, 3000); 
    },
  },
});

redisClient.on("connect", () => {
  console.log("Connected to Redis");
});

redisClient.on("error", (err) => {
  console.error("Redis connection error:", err.message);
});

// Attempt to connect, stop execution if connection fails
(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error("Unable to connect to Redis. Please ensure Redis is running.");
  }
})();

module.exports = redisClient;
