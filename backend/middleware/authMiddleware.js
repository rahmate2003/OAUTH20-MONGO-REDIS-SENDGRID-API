
// middleware/authMiddleware.js
const passport = require("passport");
require("../config/passportJwt"); // Fix: Add passport config import

const authMiddleware = passport.authenticate("jwt", { session: false });

module.exports = authMiddleware;