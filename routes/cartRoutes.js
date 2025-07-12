// routes/cartRoutes.js
const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");

router.post("/add", cartController.addToCart);
router.post("/update", cartController.updateCart);
router.get("/:userId", cartController.getCart);
router.post("/remove", cartController.removeItem);
router.delete("/clear/:userId", cartController.clearCart);

module.exports = router;
