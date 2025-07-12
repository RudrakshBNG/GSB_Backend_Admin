const express = require("express");
const router = express.Router();
const videoCategoryController = require("../controllers/videoCategoryController");

router.post("/add", videoCategoryController.addVideoCategory);
router.put("/update/:id", videoCategoryController.updateVideoCategory);
router.get("/", videoCategoryController.getAllVideoCategories);
router.delete("/delete/:id", videoCategoryController.deleteVideoCategory);

module.exports = router;
