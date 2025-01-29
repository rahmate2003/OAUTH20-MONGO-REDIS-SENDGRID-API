const nodemailer = require("nodemailer");
require("dotenv").config();

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

async function sendOTPEmail(email, otp, type) {
    const subjects = {
        register: "Verify Your Registration",
        login: "Verify Your Login"
    };

    const messages = {
        register: "complete your registration",
        login: "complete your login"
    };

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: subjects[type],
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${subjects[type]}</title>
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">
            <style>
              body { margin: 0; font-family: 'Poppins', sans-serif; background: #ffffff; font-size: 14px; }
              .container { max-width: 680px; margin: 0 auto; padding: 45px 30px 60px; background: #f4f7ff; background-image: url('https://source.unsplash.com/800x452/?nature'); background-repeat: no-repeat; background-size: cover; background-position: top center; color: #434343; }
              .content { margin-top: 70px; padding: 60px 30px; background: #ffffff; border-radius: 20px; text-align: center; }
              .otp { font-size: 40px; font-weight: 600; letter-spacing: 25px; color: #ff5733; }
              .footer { text-align: center; color: #8c8c8c; margin-top: 30px; }
              .footer a { color: #499fb6; text-decoration: none; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="content">
                <h1>Your OTP Code</h1>
                <p>Hey there,</p>
                <p>Use the following OTP to ${messages[type]}. The OTP is valid for <strong>5 minutes</strong>.</p>
                <p class="otp">${otp}</p>
                <p>If you did not request this, please ignore this email.</p>
              </div>
              <footer class="footer">
                <p>Need help? Contact us at <a href="mailto:support@company.com">support@company.com</a></p>
              </footer>
            </div>
          </body>
          </html>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`${type.toUpperCase()} OTP sent to ${email}`);
    } catch (error) {
        console.error(`Error sending ${type} OTP email:`, error);
        throw new Error(`Failed to send ${type} OTP email`);
    }
}

module.exports = { generateOTP, sendOTPEmail };