const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

// Create super admin (for initial setup)
router.post("/create-super-admin", adminController.createSuperAdmin);

// Admin login
router.post("/login", adminController.login);

// Get all admins (for debugging)
router.get("/admins", adminController.getAllAdmins);

module.exports = router;
