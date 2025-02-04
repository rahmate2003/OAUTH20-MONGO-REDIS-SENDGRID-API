
// middleware/authMiddleware.js
const passport = require("passport");
require("../config/passportJwt"); 

const authMiddleware = passport.authenticate("jwt", { session: false });

module.exports = authMiddleware;
