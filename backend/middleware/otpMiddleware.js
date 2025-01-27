const { verifyOTP } = require("../utils/otp");

const otpMiddleware = async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  try {
    const isValid = await verifyOTP(email, otp);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    next();
  } catch (error) {
    console.error("Error in OTP middleware:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = otpMiddleware;