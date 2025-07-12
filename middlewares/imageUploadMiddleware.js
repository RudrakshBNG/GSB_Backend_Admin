const multer = require("multer");

const storage = multer.memoryStorage(); // Store in memory for processing or uploading to cloud

const uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit: 5MB per image
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG, and WEBP images are allowed."));
    }
  },
}).fields([
  { name: "beforeImage", maxCount: 1 },
  { name: "afterImage", maxCount: 1 },
  { name: "image", maxCount: 1 },
]); // Accept one image with field name `image`

module.exports = uploadImage;
