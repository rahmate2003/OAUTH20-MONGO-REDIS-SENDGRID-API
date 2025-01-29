// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { validateRegistration, validateLogin, validateRefreshToken } = require("../middleware/validationMiddleware");

router.post("/register", validateRegistration, authController.register);
router.post("/register/verify", authController.verifyRegister);
router.post("/login", validateLogin, authController.login);
router.post("/login/verify", authController.verifyLogin );
router.post("/refresh-token", validateRefreshToken, authController.refreshToken );

module.exports = router;