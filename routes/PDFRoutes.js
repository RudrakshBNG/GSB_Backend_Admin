// const express = require('express');
// const router = express.Router();
// const fileUpload = require('express-fileupload');
// const { uploadPDF, getAllPDFs, incrementDownloads } = require('../controllers/pdfController');

// router.use(fileUpload());
// router.post('/upload', uploadPDF);
// router.get('/', getAllPDFs);
// router.put('/:id/download', incrementDownloads);

// module.exports = router;

// routes/dietPlanRoutes.js
const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadMiddleware");
const controller = require("../controllers/pdfController");

router.post("/", upload, controller.uploadDietPlan);
router.post("/upload", upload, controller.uploadDietPlan);
router.get("/", controller.getAllDietPlans);
router.get("/get-pdf", controller.getAllDietPlans);
router.delete("/:id", controller.deletePDF);

module.exports = router;
