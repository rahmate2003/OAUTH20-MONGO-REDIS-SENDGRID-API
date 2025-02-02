// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get("/profile", authMiddleware, roleMiddleware(["user"]), userController.getUserProfile);
router.put("/profile", authMiddleware, roleMiddleware(["user"]), userController.updateUserProfile);

module.exports = router;