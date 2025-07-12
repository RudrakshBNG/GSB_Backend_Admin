const express = require("express");
const router = express.Router();
const mockDataController = require("../controllers/mockDataController");

router.post("/add-mock-data", mockDataController.addMockData);

module.exports = router;
