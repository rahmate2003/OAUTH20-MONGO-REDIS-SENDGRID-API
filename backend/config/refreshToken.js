// config/refreshToken.js
const jwt = require("jsonwebtoken");
const redisClient = require("./redis");

const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.REFRESH_TOKEN_SECRET, 
    { expiresIn: "7d" }
  );
};

const saveRefreshToken = async (userId, refreshToken) => {
  try {
    await redisClient.setEx(
      `refresh:${userId}`, 
      7 * 24 * 60 * 60,
      refreshToken
    );
  } catch (error) {
    console.error("Redis save error:", error);
    throw new Error("Failed to save refresh token");
  }
};

const verifyRefreshToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const storedToken = await redisClient.get(`refresh:${decoded.userId}`);
    
    if (!storedToken || storedToken !== refreshToken) {
      throw new Error("Invalid refresh token");
    }
    
    return decoded;
  } catch (error) {
    console.error("Token verification error:", error);
    throw error; 
  }
};

const revokeRefreshToken = async (userId) => {
  try {
    
    await redisClient.del(`refresh:${userId}`);
  } catch (error) {
    console.error("Token revocation error:", error);
    throw new Error("Failed to revoke refresh token");
  }
};

module.exports = {
  generateRefreshToken,
  saveRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
};
