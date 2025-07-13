// const express = require('express');
// const router = express.Router();
// const storyController = require('../controllers/StoryController');
// const authMiddleware = require('../middlewares/authMiddleware');
// const upload = require('../middlewares/uploadMiddleware'); // or your S3 upload middleware

// router.post(
//   '/',
//   authMiddleware,
//   upload.fields([{ name: 'beforeImage', maxCount: 1 }, { name: 'afterImage', maxCount: 1 }]),
//   storyController.addStory
// );

// module.exports = router;

const express = require("express");
const router = express.Router();
const multer = require("multer");
const storyController = require("../controllers/StoryController");

const uploadImage = require("../middlewares/imageUploadMiddleware");

router.post(
  "/:id",
  uploadImage, // Now supports both beforeImage and afterImage
  storyController.addStory,
);

router.post(
  "/update",
  uploadImage, // For single image upload
  storyController.dailyupdate,
);

router.get("/", storyController.getAllStories);
router.get("/app", storyController.getStoriesForApp);
router.put("/toggle/:id", storyController.toggleStoryVisibility);
router.delete("/cleanup-demo", storyController.cleanupDemoStories);

module.exports = router;
