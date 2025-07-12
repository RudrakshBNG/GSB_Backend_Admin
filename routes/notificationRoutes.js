const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
//const { verifyToken } = require('../middlewares/authMiddleware'); // Optional

// Standard REST routes
router.get("/", notificationController.getNotifications);
router.post("/", notificationController.createNotification);
router.delete("/:id", notificationController.deleteNotification);
router.get("/notifications", notificationController.getNotifications);
router.post("/notification", notificationController.createNotification);

module.exports = router;
