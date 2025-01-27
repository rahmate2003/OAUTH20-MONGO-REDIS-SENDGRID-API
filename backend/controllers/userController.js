

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "Pengguna tidak ditemukan" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Terjadi kesalahan saat mengambil profil", error: error.message });
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
            return res.status(404).json({ message: "Pengguna tidak ditemukan" });
        }

        res.status(200).json({ message: "Profil berhasil diperbarui", user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: "Terjadi kesalahan saat memperbarui profil", error: error.message });
    }
};


module.exports = { getUserProfile, updateUserProfile };