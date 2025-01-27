//config/middleware.js
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const cors = require("cors");
const express = require("express");

// Rate Limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
});

const setupGlobalMiddleware = (app) => {
   
    app.use(morgan("dev"));
    app.use(limiter);

 app.use(express.json()); 
    app.use(express.urlencoded({ extended: true })); 

    
    app.use(
        cors({
            origin: process.env.CLIENT_URL || "http://localhost:3001" || "",
            credentials: true,
            methods: ["GET", "POST", "PUT", "DELETE"],
        })
    );

    
    app.use((req, res, next) => {
        const allowedMethods = ["GET", "POST", "PUT", "DELETE"];
        if (!allowedMethods.includes(req.method)) {
            return res.status(405).json({ message: "Method Not Allowed" });
        }
        next();
    });
};

module.exports = setupGlobalMiddleware;