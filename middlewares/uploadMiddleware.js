const multer = require("multer");

const storage = multer.memoryStorage();

module.exports = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
}).fields([
  { name: "pdfFile", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
]);
