// controllers/authController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { generateRefreshToken, saveRefreshToken, verifyRefreshToken } = require("../config/refreshToken");
const { generateOTP, sendOTPEmail, saveOTP, verifyOTP } = require("../utils/otp");
const requestOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const otp = generateOTP();
    await saveOTP(email, otp);
    await sendOTPEmail(email, otp);
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
  
    console.error("Error requesting OTP:", error.message);

    
    if (error.message === "OTP can only be requested once per minute") {
      return res.status(429).json({ message: error.message });
  
    } else {
      return res.status(500).json({ message: "Failed. Please try again later." });
    }
  }
};
const verifyOTPController = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  try {
    const isValid = await verifyOTP(email, otp);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid OTP or OTP has expired" });
    }
    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Failed to verify OTP" });
  }
};
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, phone, address } = req.body;

        
        const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: "Email sudah terdaftar" });
        }

        
        const hashedPassword = await bcrypt.hash(password, 10);

      
        const newUser = new User({
            name,
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            role,
            phone,
            address,
        });

       
        await newUser.save();

       
        res.status(201).json({ message: "User berhasil terdaftar", user: newUser });
    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat registrasi", error: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

       
        const user = await User.findOne({ email: email.trim().toLowerCase() });
        if (!user) {
            return res.status(400).json({ message: "Email atau password salah" });
        }

       
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Email atau password salah" });
        }

      
        const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: "15m",
        });

      
        const refreshToken = generateRefreshToken(user._id);

      
        await saveRefreshToken(user._id, refreshToken);


        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: false, 
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000,
            domain: 'localhost' 
        });

       
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false, 
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, 
            domain: 'localhost'
        });

      
        res.status(200).json({ message: "success" });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat login", error: error.message });
    }
};

const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    try {
        const user = await verifyRefreshToken(refreshToken);

       
        const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        res.json({ accessToken });
    } catch (error) {
        res.status(403).json({ message: "Refresh token tidak valid" });
    }
};
module.exports = {
  requestOTP,
  verifyOTPController,
  registerUser,
  loginUser,
  refreshToken
};
