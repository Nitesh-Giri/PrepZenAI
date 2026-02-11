const express = require("express");
const { registerUser, loginUser, getUserProfile } = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();
const fs = require("fs");
const path = require("path");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);

router.post("/upload-image", upload.single("image"), (req, res) => {
    try {
        if (req.fileValidationError) {
            return res.status(400).json({ message: req.fileValidationError });
        }

        if (!req.file) {
            return res.status(400).json({ message: "No image uploaded" });
        }

        // Ensure uploads directory exists
        const uploadsDir = path.join(process.cwd(), "uploads");
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // Build filename and write buffer to disk
        const filename = `${Date.now()}-${req.file.originalname}`;
        const filePath = path.join(uploadsDir, filename);
        if (req.file.buffer) {
            fs.writeFileSync(filePath, req.file.buffer);
        }

        const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${filename}`;
        res.status(200).json({ imageUrl });
    } catch (err) {
        res.status(500).json({ message: "Image upload failed", error: err.message });
    }
});

module.exports = router;