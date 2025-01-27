//config/redis.js
const redis = require("redis");
require("dotenv").config();

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("connect", () => {
  console.log("Connected to Redis");
});

redisClient.on("error", (err) => {
  console.error("Redis connection error:", err);
});

redisClient.connect();

module.exports = redisClient;