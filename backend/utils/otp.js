const nodemailer = require("nodemailer");
const redisClient = require("../config/redis");
require("dotenv").config();

// Konfigurasi transporter Nodemailer
const transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587, 
    secure: false,
    auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY 
    }
});


function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}


async function sendOTPEmail(email, otp) {
  const mailOptions = {
    from: process.env.EMAIL_FROM, 
    to: email, 
    subject: "Your OTP Code", 
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Login</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">
        <style>
          body { margin: 0; font-family: 'Poppins', sans-serif; background: #ffffff; font-size: 14px; }
          .container { max-width: 680px; margin: 0 auto; padding: 45px 30px 60px; background: #f4f7ff; background-image: url('https://source.unsplash.com/800x452/?nature'); background-repeat: no-repeat; background-size: cover; background-position: top center; color: #434343; }
          .content { margin-top: 70px; padding: 60px 30px; background: #ffffff; border-radius: 20px; text-align: center; }
          .otp { font-size: 40px; font-weight: 600; letter-spacing: 25px; color: #ff5733; }
          .footer { text-align: center; color: #8c8c8c; margin-top: 30px; }
          .footer a { color: #499fb6; text-decoration: none; }
          @media screen and (max-width: 600px) {
            .container { padding: 20px; }
            .otp { font-size: 30px; letter-spacing: 15px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <header>
            <img src="https://source.unsplash.com/100x50/?logo" alt="Company Logo" height="30px" style="display: block; margin: 0 auto;">
          </header>
          <div class="content">
            <h1>Your OTP Code</h1>
            <p>Hey there,</p>
            <p>Thank you for using our service. Use the following OTP to complete your verification. The OTP is valid for <strong>5 minutes</strong>.</p>
            <p class="otp">${otp}</p>
            <p>If you did not request this, please ignore this email.</p>
          </div>
          <footer class="footer">
            <p>Need help? Contact us at <a href="mailto:support@company.com">support@company.com</a></p>
            <p>&copy; 2025 Your Company. All rights reserved.</p>
          </footer>
        </div>
      </body>
      </html>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
}

async function saveOTP(email, otp) {
  try {
    const lastRequestTime = await redisClient.get(`otp_request_time:${email}`);
    if (lastRequestTime && Date.now() - parseInt(lastRequestTime) < 60000) {
      throw new Error("OTP can only be requested once per minute");
    }

    await redisClient.setEx(`otp:${email}`, 300, otp); 

    await redisClient.setEx(`otp_request_time:${email}`, 60, Date.now().toString());

    console.log(`OTP saved for ${email}`);
  } catch (error) {
    console.error("Error saving OTP to Redis:", error.message);
    throw error;
  }
}
async function verifyOTP(email, otp) {
  try {
    const storedOTP = await redisClient.get(`otp:${email}`);
    return storedOTP === otp;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    throw new Error("Failed to verify OTP");
  }
}

module.exports = { generateOTP, sendOTPEmail, saveOTP, verifyOTP };