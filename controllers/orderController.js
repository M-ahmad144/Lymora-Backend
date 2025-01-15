const Order = require("../models/orderModel.js");
const Product = require("../models/productModel.js");
const asyncHandler = require("../middlewares/asyncHandler");

// =============================
// Utility Function: Calculate Prices
// =============================
const calcPrices = (orderItems) => {
  const itemsPrice = orderItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );
  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const taxRate = 0.15;
  const taxPrice = (itemsPrice * taxRate).toFixed(2);
  const totalPrice = (
    itemsPrice +
    shippingPrice +
    parseFloat(taxPrice)
  ).toFixed(2);

  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice,
    totalPrice,
  };
};

// =============================
// Create a New Order
// =============================
const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400).json({ error: "No order items" });
    return;
  }
  //get valid order items ids from the DB
  const itemsFromDB = await Product.find({
    _id: { $in: orderItems.map((x) => x._id) },
  });
  //vaidate the items from the client side with the items from the DB
  const dbOrderItems = orderItems.map((itemFromClient) => {
    const matchingItemFromDB = itemsFromDB.find(
      (itemFromDB) => itemFromDB._id.toString() === itemFromClient._id
    );

    if (!matchingItemFromDB) {
      throw new Error(`Product not found: ${itemFromClient._id}`);
    }

    return {
      ...itemFromClient,
      product: itemFromClient._id,
      price: matchingItemFromDB.price,
      _id: undefined,
    };
  });

  const { itemsPrice, taxPrice, shippingPrice, totalPrice } =
    calcPrices(dbOrderItems);

  const order = new Order({
    orderItems: dbOrderItems,
    user: req.user._id,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  });

  const createdOrder = await order.save();
  res.status(201).json(createdOrder);
});

// =============================
// Fetch All Orders
// =============================
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate("user", "id username");
  res.json(orders);
});

// =============================
// Fetch Orders for Logged-in User
// =============================
const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
});

// =============================
// Count Total Orders
// =============================
const countTotalOrders = asyncHandler(async (req, res) => {
  const totalOrders = await Order.countDocuments();
  res.json({ totalOrders });
});

// =============================
// Calculate Total Sales
// =============================
const calculateTotalSales = asyncHandler(async (req, res) => {
  const orders = await Order.find();
  const totalSales = orders.reduce((sum, order) => sum + order.totalPrice, 0);
  res.json({ totalSales });
});

// =============================
// Calculate Total Sales by Date
// =============================
const calculateTotalSalesByDate = asyncHandler(async (req, res) => {
  const salesByDate = await Order.aggregate([
    { $match: { isPaid: true } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$paidAt" } },
        totalSales: { $sum: "$totalPrice" },
      },
    },
  ]);
  res.json(salesByDate);
});

// =============================
// Find Order by ID
// =============================
const findOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "username email"
  );

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  res.json(order);
});

// =============================
// Mark Order as Paid
// =============================
const markOrderAsPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.isPaid = true;
  order.paidAt = Date.now();
  order.paymentResult = {
    id: req.body.id,
    status: req.body.status,
    update_time: req.body.update_time,
    email_address: req.body.payer.email_address,
  };

  const updatedOrder = await order.save();
  res.status(200).json(updatedOrder);
});

// =============================
// Mark Order as Delivered
// =============================
const markOrderAsDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.isDelivered = true;
  order.deliveredAt = Date.now();

  const updatedOrder = await order.save();
  res.json(updatedOrder);
});

module.exports = {
  createOrder,
  getAllOrders,
  getUserOrders,
  countTotalOrders,
  calculateTotalSales,
  calculateTotalSalesByDate,
  findOrderById,
  markOrderAsPaid,
  markOrderAsDelivered,
};
