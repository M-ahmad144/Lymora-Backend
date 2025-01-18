const express = require("express");
const router = express.Router();

const {
  createOrder,
  getAllOrders,
  getUserOrders,
  countTotalOrders,
  calculateTotalSales,
  calculateTotalSalesByDate,
  findOrderById,
  markOrderAsPaid,
  markOrderAsDelivered,
} = require("../controllers/orderController.js");

const {
  authMiddleware,
  authAdmin,
} = require("../middlewares/authMiddleware.js");

router
  .route("/")
  .post(authMiddleware, createOrder)
  .get(authMiddleware, authAdmin, getAllOrders);

router.route("/mine").get(authMiddleware, getUserOrders);
router.route("/total-orders").get(countTotalOrders);
router.route("/total-sales").get(calculateTotalSales);
router.route("/total-sales-by-date").get(calculateTotalSalesByDate);
router.route("/:id").get(authMiddleware, findOrderById);
router.route("/:id/pay").put(authMiddleware, markOrderAsPaid);
router
  .route("/:id/deliver")
  .put(authMiddleware, authAdmin, markOrderAsDelivered);

module.exports = router;
