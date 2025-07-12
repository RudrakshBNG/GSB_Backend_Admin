// routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const {
  placeOrder,
  getOrdersByUser,
  getAllOrders,
} = require("../controllers/orderController");

router.post("/place-order", placeOrder);
router.put(
  "/:orderId/status",
  require("../controllers/orderController").updateOrderStatus,
);

router.get("/user/:userId", getOrdersByUser);
router.get("/", getAllOrders);

module.exports = router;
