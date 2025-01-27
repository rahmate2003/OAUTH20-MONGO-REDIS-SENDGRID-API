// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

  
    const statusCode = err.statusCode || 500;
    const message = err.message || "Error on Server";

    res.status(statusCode).json({
        success: false,
        message,
        error: process.env.NODE_ENV === "development" ? err.stack : {},
    });
};

module.exports = errorHandler;