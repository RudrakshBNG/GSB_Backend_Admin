const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

// Create new payment
router.post("/", paymentController.createPayment);

// Get all payments
router.get("/", paymentController.getAllPayments);

// Get payment analytics
router.get("/analytics", paymentController.getPaymentAnalytics);

// Get payments by user
router.get("/user/:userId", paymentController.getPaymentsByUser);

module.exports = router;
