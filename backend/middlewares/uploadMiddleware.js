const multer = require("multer");

// Use memory storage to avoid writing directly to disk (safer for serverless environments)
const storage = multer.memoryStorage();

// file filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        // Do not throw an error here; flag the validation error so the route can return a 400 with a clear message
        req.fileValidationError = "Only JPEG, PNG, JPG and WEBP images are allowed";
        cb(null, false);
    }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;