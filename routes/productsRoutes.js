const express = require("express");
const formidable = require("express-formidable");
const router = express.Router();

// controllers
const {
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
} = require("../controllers/productsController");

const checkId = require("../middlewares/checkId");

router.route("/").get(fetchProducts).post(formidable(), addProduct);

router.route("/allproducts").get(fetchAllProducts);
router.route("/:id/reviews").post(checkId, addProductReview);

router.get("/top", fetchTopProducts);
router.get("/new", fetchNewProducts);

router
  .route("/:id")
  .get(fetchProductById)
  .put(formidable(), updateProductDetails)
  .delete(removeProduct);

router.route("/filtered-products").post(filterProducts);

module.exports = router;
