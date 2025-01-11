const express = require("express");
const router = express.Router();
const { authMiddleware, authAdmin } = require("../middlewares/authMiddleware");

const {
  createCategory,
  updateCategory,
  removeCategory,
  listCategory,
  readCategory,
} = require("../controllers/categoryController");

router.route("/").post(authMiddleware, authAdmin, createCategory);
router.route("/:categoryId").put(authMiddleware, authAdmin, updateCategory);
router.route("/:categoryId").delete(authMiddleware, authAdmin, removeCategory);
router.route("/").get(listCategory);
router.route("/:categoryId").get(readCategory);

module.exports = router;
