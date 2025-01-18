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

router.route("/").post(createOrder).get(getAllOrders);

router.route("/mine").get(getUserOrders);
router.route("/total-orders").get(countTotalOrders);
router.route("/total-sales").get(calculateTotalSales);
router.route("/total-sales-by-date").get(calculateTotalSalesByDate);
router.route("/:id").get(findOrderById);
router.route("/:id/pay").put(markOrderAsPaid);
router.route("/:id/deliver").put(markOrderAsDelivered);

module.exports = router;
