const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const uploadImage = require("../middlewares/imageUploadMiddleware");
const videoUpload = require("../middlewares/videouploadMiddleware");
const uploadMiddleware = require("../middlewares/uploadMiddleware");

// Combined middleware for images, videos, and PDFs
const chatUpload = (req, res, next) => {
  uploadImage(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    videoUpload(req, res, (err) => {
      if (err) return res.status(400).json({ message: err.message });
      uploadMiddleware(req, res, (err) => {
        if (err) return res.status(400).json({ message: err.message });
        // Combine files from all middleware
        req.files = {
          media: req.files?.image || req.files?.video || req.files?.pdfFile,
        };
        next();
      });
    });
  });
};

router.get("/", chatController.getAllChats);
router.post("/", chatController.createChat);
router.post("/assign", chatController.assignChat);
router.get("/chats", chatController.getAllChats);
router.post("/chats", chatController.createChat);
router.put("/chats/assign", chatController.assignChat);

router.get(
  "/team-members/:memberId/assigned-chats",
  chatController.getAssignedChats
);

router.post("/send", chatUpload, chatController.sendMessage);
router.post("/:chatId/reply", chatUpload, chatController.replyToChat);

router.get("/:chatId", chatController.getChatById);
router.put("/:chatId/resolve", chatController.markChatResolved);

module.exports = router;
// const express = require("express");
// const router = express.Router();
// const chatController = require("../controllers/chatController");

// // Standard REST routes
// router.get("/", chatController.getAllChats);
// router.post("/", chatController.createChat);
// router.post("/assign", chatController.assignChat);
// router.get("/chats", chatController.getAllChats);
// router.post("/chats", chatController.createChat);
// router.put("/chats/assign", chatController.assignChat);

// router.get(
//   "/team-members/:memberId/assigned-chats",
//   chatController.getAssignedChats,
// );

// router.post("/send", chatController.sendMessage);

// // Admin: Reply to a chat
// router.post("/:chatId/reply", chatController.replyToChat);

// // Get a specific chat by ID
// router.get("/:chatId", chatController.getChatById);

// // Mark chat as resolved
// router.put("/:chatId/resolve", chatController.markChatResolved);

// module.exports = router;
