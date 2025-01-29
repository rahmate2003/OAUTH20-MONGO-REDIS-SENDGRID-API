const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const redisClient = require("../config/redis");
const { generateOTP, sendOTPEmail } = require("../utils/otp");
const { generateRefreshToken, saveRefreshToken, verifyRefreshToken, revokeRefreshToken } = require("../config/refreshToken");

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const type ='register';
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const registrationData = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    };
    const tempToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '10m' });
    await redisClient.setEx(`reg:${tempToken}`, 600, JSON.stringify(registrationData));
    await redisClient.setEx(`otp:${tempToken}`, 600, otp);
    await sendOTPEmail(email, otp, type);
    res.status(200).json({ 
      message: "Registration initiated. Please verify OTP.",
      token: tempToken 
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Registration failed" });
  }
};
const verifyRegister = async (req, res) => {
  try {
    const { token, type, otp } = req.body;
    if (type !== 'register') {
      return res.status(400).json({ message: "Invalid verification type" });
    }
    const storedOTP = await redisClient.get(`otp:${token}`);
    const registrationData = await redisClient.get(`reg:${token}`);
    if (!storedOTP || !registrationData) {
      return res.status(400).json({ message: "Verification expired" });
    }
    if (storedOTP !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    const userData = JSON.parse(registrationData);
    const newUser = new User(userData);
    await newUser.save();
    await redisClient.del(`otp:${token}`);
    await redisClient.del(`reg:${token}`);
    res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    console.error("Registration verification error:", error);
    res.status(500).json({ message: "Verification failed" });
  }
};
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const type ='login';
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const otp = generateOTP();
    const tempToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '10m' });
    await redisClient.setEx(`otp:${tempToken}`, 600, otp);
    await sendOTPEmail(user.email, otp);
    res.status(200).json({ 
      message: "Login initiated. Please verify OTP.",
      token: tempToken 
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
};
const verifyLogin = async (req, res) => {
  try {
    const { token, type, otp } = req.body;
    console.log("🟢 Received request:", { token, type, otp });
    if (type !== "login") {
      console.log("🔴 Invalid verification type:", type);
      return res.status(400).json({ message: "Invalid verification type" });
    }
    const storedOTP = await redisClient.get(`otp:${token}`);
    console.log("🟢 Stored OTP from Redis:", storedOTP);
    if (!storedOTP) {
      console.log("🔴 OTP expired or not found in Redis");
      return res.status(400).json({ message: "Verification expired" });
    }
    if (storedOTP !== otp) {
      console.log("🔴 Invalid OTP:", { received: otp, expected: storedOTP });
      return res.status(400).json({ message: "Invalid OTP" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🟢 Token decoded:", decoded);
    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );
    console.log("🟢 Generated access token");
    const refreshToken = jwt.sign(
      { userId: decoded.userId },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );
    console.log("🟢 Generated refresh token");
    await redisClient.del(`otp:${token}`);
    console.log("🟢 OTP deleted from Redis");
    await redisClient.setEx(`refresh:${decoded.userId}`, 7 * 24 * 60 * 60, refreshToken);
    console.log("🟢 Refresh token stored in Redis");

      // Set cookie untuk access token
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: false, // Set false karena di localhost (HTTP)
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000, // 15 menit
            domain: 'localhost' // Sesuaikan dengan domain Anda
        });

        // Set cookie untuk refresh token
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false, // Set false karena di localhost (HTTP)
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
            domain: 'localhost' // Sesuaikan dengan domain Anda
        });

    res.status(200).json({
      success: true
    });
 
      
  } catch (error) {
    console.error("❌ Login verification error:", error);
    res.status(500).json({ message: "Verification failed" });
  }
};
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: "Refresh token is required" 
      });
    }
    const decoded = await verifyRefreshToken(token);
 const accessToken = jwt.sign(
  { userId: decoded.userId }, 
  process.env.JWT_SECRET, 
  { expiresIn: "15m" }
);
    const newRefreshToken = generateRefreshToken(decoded.userId);
    await revokeRefreshToken(decoded.userId);
    await saveRefreshToken(decoded.userId, newRefreshToken);
    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    if (error.name === 'JsonWebTokenError' || error.message === 'Invalid refresh token') {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token"
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: "Refresh token expired"
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to refresh token"
    });
  }
};
module.exports = {
  register,
  verifyRegister,
  login,
  verifyLogin,
  refreshToken
};