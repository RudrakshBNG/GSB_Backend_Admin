const express = require("express");
const router = express.Router();
const dailyUpdateController = require("../controllers/DailyUpdateController");
const uploadImage = require("../middlewares/imageUploadMiddleware");

router.post("/", uploadImage, dailyUpdateController.addDailyUpdate);
router.get("/", dailyUpdateController.getAllDailyUpdates);
router.put("/:id", uploadImage, dailyUpdateController.updateDailyUpdate);
router.delete("/:id", dailyUpdateController.deleteDailyUpdate);
router.delete(
  "/cleanup-demo/all",
  dailyUpdateController.cleanupDemoDailyUpdates
);
router.get("/user/:userId", dailyUpdateController.getDailyUpdateOnUserId);

module.exports = router;
// const express = require("express");
// const router = express.Router();
// const dailyUpdateController = require("../controllers/DailyUpdateController");
// const uploadImage = require("../middlewares/imageUploadMiddleware");

// router.post("/", uploadImage, dailyUpdateController.addDailyUpdate);
// router.get("/", dailyUpdateController.getAllDailyUpdates);
// router.put("/:id", uploadImage, dailyUpdateController.updateDailyUpdate);
// router.delete("/:id", dailyUpdateController.deleteDailyUpdate);
// router.delete(
//   "/cleanup-demo/all",
//   dailyUpdateController.cleanupDemoDailyUpdates
// );
// router.get("/:id", dailyUpdateController.getDailyUpdateOnUserId);

// module.exports = router;
