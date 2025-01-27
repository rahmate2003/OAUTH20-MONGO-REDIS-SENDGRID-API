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
    // Hanya tampilkan pesan error tanpa stack trace
    console.error("Error requesting OTP:", error.message);

    // Berikan pesan error yang lebih spesifik
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

        // Cek apakah email sudah terdaftar
        const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: "Email sudah terdaftar" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Buat user baru
        const newUser = new User({
            name,
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            role,
            phone,
            address,
        });

        // Simpan user ke database
        await newUser.save();

        // Kirim respons sukses
        res.status(201).json({ message: "User berhasil terdaftar", user: newUser });
    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat registrasi", error: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Cari user berdasarkan email
        const user = await User.findOne({ email: email.trim().toLowerCase() });
        if (!user) {
            return res.status(400).json({ message: "Email atau password salah" });
        }

        // Bandingkan password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Email atau password salah" });
        }

        // Generate access token
        const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: "15m",
        });

        // Generate refresh token
        const refreshToken = generateRefreshToken(user._id);

        // Simpan refresh token ke database
        await saveRefreshToken(user._id, refreshToken);

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

        // Kirim respons sukses
        res.status(200).json({ message: "success" });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat login", error: error.message });
    }
};
// Refresh token
const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    try {
        const user = await verifyRefreshToken(refreshToken);

        // Generate access token baru
        const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: "1h", // Token akses berlaku 1 jam
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
