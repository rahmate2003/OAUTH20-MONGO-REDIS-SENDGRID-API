
const User = require("../models/User");
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User Not Found" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Error when get profile", error: error.message });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const { name, phone, address } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { name, phone, address },
            { new: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ message: "User Not Found" });
        }

        res.status(200).json({ message: "Profile success updated", user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: "Error when updated profile", error: error.message });
    }
};


module.exports = { getUserProfile, updateUserProfile };