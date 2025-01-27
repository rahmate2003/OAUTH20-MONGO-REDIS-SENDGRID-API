//config/passportGoogle.js
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
             
                if (!profile.emails || !profile.emails[0] || !profile.photos || !profile.photos[0]) {
                    return done(new Error("Email or profile picture not available"), null);
                }

                const email = profile.emails[0].value;
                const existingUser = await User.findOne({ email });

                if (existingUser) {
                    return done(null, existingUser);
                }

                const newUser = new User({
                    name: profile.displayName,
                    email: email,
                    googleId: profile.id,
                    profilePicture: profile.photos[0].value, 
                });

                await newUser.save();
                done(null, newUser);
            } catch (error) {
                done(error, null);
            }
        }
    )
);

// Serialize dan Deserialize User
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;