const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedVideoTypes = ["video/mp4", "video/mpeg", "video/quicktime"];
  const allowedImageTypes = ["image/jpeg", "image/png"];

  if (
    file.fieldname === "video" &&
    !allowedVideoTypes.includes(file.mimetype)
  ) {
    return cb(
      new Error(
        "Invalid video file type. Only MP4, MPEG, or QuickTime allowed."
      )
    );
  }
  if (
    file.fieldname === "thumbnail" &&
    !allowedImageTypes.includes(file.mimetype)
  ) {
    return cb(
      new Error("Invalid thumbnail file type. Only JPEG or PNG allowed.")
    );
  }
  cb(null, true);
};

module.exports = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB for videos
    files: 2, // Max 2 files (video + thumbnail)
  },
  fileFilter,
}).fields([
  { name: "video", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
]);
