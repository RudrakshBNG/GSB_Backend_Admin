// controllers/orderController.js
const Order = require("../models/Order");
const Cart = require("../models/Cart");

exports.placeOrder = async (req, res) => {
  try {
    const { userId, contactInfo, paymentMethod } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart || !cart.items.length) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const total = cart.items.reduce(
      (sum, item) => sum + Number(item.price || 0),
      0,
    );

    const order = new Order({
      userId,
      items: cart.items,
      contactInfo,
      paymentMethod,
      total,
    });

    await order.save();
    await Cart.findOneAndDelete({ userId });

    res
      .status(201)
      .json({ message: "Order placed successfully", orderId: order._id });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to place order", error: err.message });
  }
};

exports.getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ message: "Orders fetched", orders });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch orders", error: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "fullName email phoneNumber")
      .sort({ createdAt: -1 });
    res.status(200).json({ message: "All orders fetched", orders });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch orders", error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true },
    ).populate("userId", "fullName email phoneNumber");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order status updated", order });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update order status", error: error.message });
  }
};
