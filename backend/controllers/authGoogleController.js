///controllers/authGoogleController.js
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { generateRefreshToken, saveRefreshToken } = require("../config/refreshToken");

// Handler untuk route /google
exports.initiateGoogleLogin = (req, res, next) => {
    const state = Math.random().toString(36).substring(7);
    req.session.state = state; // Simpan state di session
    passport.authenticate("google", { scope: ["profile", "email"], state: state })(req, res, next);
};
exports.handleGoogleCallback = (req, res, next) => {
    // Periksa state parameter untuk mencegah CSRF
    if (req.query.state !== req.session.state) {
        return res.status(400).json({ message: "Invalid state parameter" });
    }

    // Hapus state dari session setelah pengecekan
    delete req.session.state;

    // Proses autentikasi dengan Google
    passport.authenticate("google", { failureRedirect: "/login", session: false }, async (err, user, info) => {
        if (err) {
            return res.status(500).json({ message: "Terjadi kesalahan saat autentikasi", error: err.message });
        }
        if (!user) {
            return res.status(401).json({ message: "Autentikasi gagal", info });
        }

        try {
            // Generate access token
            const accessToken = jwt.sign(
                { id: user._id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: "15m" }
            );

            // Generate refresh token
            const refreshToken = generateRefreshToken(user._id);

            // Simpan refresh token ke database
            await saveRefreshToken(user._id, refreshToken);

            // Set cookie
            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                maxAge: 15 * 60 * 1000, // 1 jam
                domain: 'localhost'
            });

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
                domain: 'localhost'
            });

            // Redirect ke frontend dengan parameter token (opsional)
            res.redirect(`http://localhost:5000/login/success?accessToken=${accessToken}`);
        } catch (error) {
            console.error("Error during Google authentication:", error);
            res.redirect(`http://localhost:5000/login/error`);
        }
    })(req, res, next);
};