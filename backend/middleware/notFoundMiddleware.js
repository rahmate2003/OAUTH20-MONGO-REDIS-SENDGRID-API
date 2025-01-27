// middleware/notFoundMiddleware.js
const notFoundMiddleware = (req, res, next) => {
    res.status(404).json({ message: "Route Not Found" });
};

module.exports = notFoundMiddleware;