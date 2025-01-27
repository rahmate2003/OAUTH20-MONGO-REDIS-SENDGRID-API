// middleware/validationMiddleware.js
const { body, validationResult } = require("express-validator");

const validateRegistration = [
    body("name").notEmpty().withMessage("Nama harus diisi"),
    body("email").isEmail().withMessage("Email tidak valid"),
    body("password").isLength({ min: 8 }).withMessage("Password minimal 6 karakter"),
];

const validateLogin = [
    body("email").isEmail().withMessage("Email tidak valid"),
    body("password").notEmpty().withMessage("Password harus diisi"),
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
    handleValidationErrors,
};