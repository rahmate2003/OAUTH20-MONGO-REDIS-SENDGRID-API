// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    googleId: { type: String },
    profilePicture: { type: String }, 
    role: { type: String, enum: ["user"], default: "user" },
    phone: { type: String },
    address: { type: String },
    bio: { type: String },
    services: [{ type: String }],
    pricePerDay: { type: Number },
    rating: { type: Number, default: 0 },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
    refreshToken: { type: String }, 
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);