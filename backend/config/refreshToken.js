//config/refreshToken.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Generate refresh token
const generateRefreshToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d",
    });
};


const saveRefreshToken = async (userId, refreshToken) => {
    try {
        await User.findByIdAndUpdate(userId, { refreshToken });
    } catch (error) {
        throw new Error("Failed Save Refresh Token");
    }
};


const verifyRefreshToken = async (refreshToken) => {
    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decoded.id);

        if (!user || user.refreshToken !== refreshToken) {
            throw new Error("Refresh token invalid");
        }

        return user;
    } catch (error) {
        throw new Error("Refresh token invalid");
    }
};

module.exports = {
    generateRefreshToken,
    saveRefreshToken,
    verifyRefreshToken,
};