// middleware/roleMiddleware.js
const roleMiddleware = (allowedRoles) => (req, res, next) => {
    try {
        // Pastikan req.user ada
        if (!req.user) {
            return res.status(401).json({ message: "User not authenticated. Please log in." });
        }

        // Pastikan allowedRoles disediakan
        if (!allowedRoles || !Array.isArray(allowedRoles)) {
            return res.status(500).json({ message: "Allowed roles are not defined correctly in the middleware." });
        }

        // Pastikan user memiliki properti role
        if (!req.user.role) {
            return res.status(400).json({ message: "User role is missing from the token." });
        }

        // Periksa apakah peran user sesuai dengan peran yang diizinkan
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: `Access denied. Role Denied` });
        }

        // Jika semua validasi lolos, lanjutkan ke middleware/rute berikutnya
        next();
    } catch (error) {
        console.error("Error in roleMiddleware:", error);
        res.status(500).json({ message: "An unexpected error occurred in roleMiddleware." });
    }
};

module.exports = roleMiddleware;