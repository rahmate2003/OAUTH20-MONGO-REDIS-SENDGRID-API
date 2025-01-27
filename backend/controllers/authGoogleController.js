///controllers/authGoogleController.js
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { generateRefreshToken, saveRefreshToken } = require("../config/refreshToken");


exports.initiateGoogleLogin = (req, res, next) => {
    const state = Math.random().toString(36).substring(7);
    req.session.state = state; // Simpan state di session
    passport.authenticate("google", { scope: ["profile", "email"], state: state })(req, res, next);
};
exports.handleGoogleCallback = (req, res, next) => {
    
    if (req.query.state !== req.session.state) {
        return res.status(400).json({ message: "Invalid state parameter" });
    }

    
    delete req.session.state;

   
    passport.authenticate("google", { failureRedirect: "/login", session: false }, async (err, user, info) => {
        if (err) {
            return res.status(500).json({ message: "Terjadi kesalahan saat autentikasi", error: err.message });
        }
        if (!user) {
            return res.status(401).json({ message: "Autentikasi gagal", info });
        }

        try {
          
            const accessToken = jwt.sign(
                { id: user._id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: "15m" }
            );

          
            const refreshToken = generateRefreshToken(user._id);

        
            await saveRefreshToken(user._id, refreshToken);


            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                maxAge: 15 * 60 * 1000, 
                domain: 'localhost'
            });

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000, 
                domain: 'localhost'
            });

        
            res.redirect(`http://localhost:5000/login/success?accessToken=${accessToken}`);
        } catch (error) {
            console.error("Error during Google authentication:", error);
            res.redirect(`http://localhost:5000/login/error`);
        }
    })(req, res, next);
};