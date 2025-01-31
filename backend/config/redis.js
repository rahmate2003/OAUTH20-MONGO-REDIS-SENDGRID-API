// config/redis.js
const redis = require("redis");
require("dotenv").config();

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const redisClient = redis.createClient({
  url: REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 5) { // Limit retries to 5 attempts
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
