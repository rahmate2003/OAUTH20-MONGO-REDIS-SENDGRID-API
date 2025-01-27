// middleware/uploadMiddleware.js
const multer = require("multer");
const path = require("path");
const jsteg = require("jsteg"); 
const fs = require("fs");

// Konfigurasi penyimpanan file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); 
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
});


const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
        cb(null, true);
    } else {
        cb(new Error("File harus berupa gambar"), false);
    }
};

const upload = multer({ storage, fileFilter });


const checkForSteganography = (req, res, next) => {
    if (!req.file) {
        return next();
    }

    const filePath = req.file.path;

    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            return next(err);
        }

      
        const hiddenData = jsteg.decode(data);
        if (hiddenData) {
        
            fs.unlink(filePath, (err) => {
                if (err) console.error("Gagal menghapus file:", err);
            });
            return res.status(400).json({ message: "File mengandung steganografi. Upload ditolak." });
        }

       
        next();
    });
};

module.exports = { upload, checkForSteganography };