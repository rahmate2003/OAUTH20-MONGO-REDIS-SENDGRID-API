const express = require("express");
const session = require("express-session");
const connectDB = require("./config/db");
const setupGlobalMiddleware = require("./config/middleware");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const notFoundMiddleware = require("./middleware/notFoundMiddleware");
require("dotenv").config();
const passport = require("passport");
require("./config/passportJwt"); 
require("./config/passportGoogle");

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.SESSION_SECRET) {
  console.error("SESSION_SECRET environment variable is not set");
  process.exit(1);
}

connectDB();

setupGlobalMiddleware(app);
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production" }, 
  })
);

app.use(passport.initialize());


app.use("/api/auth", authRoutes); 
app.use("/api/user", userRoutes); 


app.use(notFoundMiddleware);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});