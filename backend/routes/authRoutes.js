//routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authGoogleController = require("../controllers/authGoogleController");
const otpMiddleware = require("../middleware/otpMiddleware");
const { validateRegistration, validateLogin, handleValidationErrors } = require("../middleware/validationMiddleware");


router.post("/request-otp", authController.requestOTP);


router.post("/verify-otp", otpMiddleware, authController.verifyOTPController);


router.get("/google", authGoogleController.initiateGoogleLogin);


router.get("/google/callback", authGoogleController.handleGoogleCallback);


router.post("/register", validateRegistration, handleValidationErrors, authController.registerUser);


router.post("/login", validateLogin, handleValidationErrors, authController.loginUser);


router.post("/refresh-token", authController.refreshToken);

module.exports = router;