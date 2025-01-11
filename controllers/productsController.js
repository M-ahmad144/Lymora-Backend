const asyncHandler = require("../middlewares/asyncHandler");
const Product = require("../models/productModel");

// =============================
// Utility Function for Validation
// =============================
const validateProductFields = (fields) => {
  const { name, description, price, category, quantity, brand } = fields;

  if (!name) return "Name is required";
  if (!brand) return "Brand is required";
  if (!description) return "Description is required";
  if (!price) return "Price is required";
  if (!category) return "Category is required";
  if (!quantity) return "Quantity is required";

  return null; // No validation errors
};

// =============================
// Add New Product
// =============================
const addProduct = asyncHandler(async (req, res) => {
  const validationError = validateProductFields(req.fields);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const product = new Product({ ...req.fields });

  await product.save();
  res.status(201).json({
    product,
  });
});

// =============================
// Update Product Details
// =============================
const updateProductDetails = asyncHandler(async (req, res) => {
  const validationError = validateProductFields(req.fields);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { ...req.fields },
    { new: true }
  );

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  res.status(200).json(product);
});

// =============================
// Remove Product
// =============================
const removeProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  res.status(200).json({ message: "Product deleted successfully" });
});

// =============================
// Fetch All Products with Pagination
// =============================
const fetchProducts = asyncHandler(async (req, res) => {
  const pageSize = 6;
  const page = Number(req.query.pageNumber) || 1;

  // 3. Check if a search keyword is provided, and if so, construct a regex query for searching products by name.
  const keyword = req.query.keyword
    ? { name: { $regex: req.query.keyword, $options: "i" } } // Case-insensitive search for product name
    : {}; // If no keyword, no filter is applied

  const count = await Product.countDocuments({ ...keyword });
  const products = await Product.find({ ...keyword })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    products,
    page,
    pages: Math.ceil(count / pageSize),
  });
});

// =============================
// Fetch Single Product by ID
// =============================
const fetchProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  res.json(product);
});

// =============================
// Fetch All Products
// =============================
const fetchAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({})
    .populate("category")
    .limit(12)
    .sort({ createdAt: -1 });

  res.json(products);
});

// =============================
// Add Product Review
// =============================
const addProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  const alreadyReviewed = product.reviews.find(
    (review) => review.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    return res.status(400).json({ error: "Product already reviewed" });
  }

  const review = {
    name: req.user.username,
    rating: Number(rating),
    comment,
    user: req.user._id,
  };

  product.reviews.push(review);
  product.numReviews = product.reviews.length;
  product.rating =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  await product.save();
  res.status(201).json({ message: "Review added successfully" });
});

// =============================
// Fetch Top-Rated Products
// =============================
const fetchTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ rating: -1 }).limit(4);
  res.json(products);
});

// =============================
// Fetch Newly Added Products
// =============================
const fetchNewProducts = asyncHandler(async (req, res) => {
  const products = await Product.find().sort({ _id: -1 }).limit(5);
  res.json(products);
});

// =============================
// Filter Products by Criteria
// =============================
const filterProducts = asyncHandler(async (req, res) => {
  const { checked, radio } = req.body;

  let filters = {};
  if (checked.length > 0) filters.category = checked; // categories will be filtered by checkbox
  if (radio.length) filters.price = { $gte: radio[0], $lte: radio[1] };

  const products = await Product.find(filters);
  res.json(products);
});

// =============================
// Export Controllers
// =============================
module.exports = {
  addProduct,
  updateProductDetails,
  removeProduct,
  fetchProducts,
  fetchProductById,
  fetchAllProducts,
  addProductReview,
  fetchTopProducts,
  fetchNewProducts,
  filterProducts,
};
