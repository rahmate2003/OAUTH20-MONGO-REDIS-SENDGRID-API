// middleware/validationMiddleware.js
const { body, validationResult } = require("express-validator");

const validateRegistration = [
    body("name").notEmpty().withMessage("Name should be filled"),
    body("email").isEmail().withMessage("Email invalid"),
    body("password").isLength({ min: 8 }).withMessage("Password min 6 "),
];

const validateLogin = [
    body("email").isEmail().withMessage("Email invalid"),
    body("password").notEmpty().withMessage("Password should be filled"),
];

const validateRefreshToken = [
  body('refreshToken')
    .trim()
    .notEmpty()
    .withMessage('Refresh token is required'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

module.exports = {
    validateRegistration,
    validateLogin,
    handleValidationErrors,validateRefreshToken
};