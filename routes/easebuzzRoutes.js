const express = require("express");
const router = express.Router();
const easebuzzController = require("../controllers/easebuzzController");

// Initiate payment
router.post("/initiate", easebuzzController.initiatePayment);

// Payment success callback
router.post("/success", easebuzzController.handleSuccess);

// Payment failure callback
router.post("/failure", easebuzzController.handleFailure);

// Check payment status
router.get("/status/:transactionId", easebuzzController.checkPaymentStatus);

// Get all Easebuzz payments (admin)
router.get("/payments", easebuzzController.getAllEasebuzzPayments);

// Refund payment (admin)
router.post("/refund", easebuzzController.refundPayment);

module.exports = router;
