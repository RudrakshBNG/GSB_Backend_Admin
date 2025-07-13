const { uploadFileToS3 } = require("../services/s3Uploader");

exports.uploadToS3 = async (req, res) => {
  try {
    const { folder } = req.body;
    const file = req.files?.file;

    if (!file) {
      return res.status(400).json({ message: "No file provided" });
    }

    if (!folder) {
      return res.status(400).json({ message: "Folder is required" });
    }

    // Validate file types
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "video/mp4",
      "video/mpeg",
      "video/quicktime",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        message:
          "Invalid file type. Only images, videos, and PDFs are allowed.",
      });
    }

    // Validate file size
    const maxSize = file.mimetype.startsWith("image")
      ? 5 * 1024 * 1024 // 5MB for images
      : 100 * 1024 * 1024; // 100MB for videos/PDFs

    if (file.size > maxSize) {
      return res.status(400).json({
        message: `File too large. Maximum size is ${maxSize / (1024 * 1024)}MB`,
      });
    }

    console.log(`Uploading file to S3 folder: ${folder}`);
    const fileUrl = await uploadFileToS3(file, folder);

    res.status(200).json({
      message: "File uploaded successfully",
      fileUrl,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
    });
  } catch (error) {
    console.error("S3 upload error:", error);
    res.status(500).json({
      message: "File upload failed",
      error: error.message,
    });
  }
};
