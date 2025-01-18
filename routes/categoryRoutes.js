const express = require("express");
const router = express.Router();

const {
  createCategory,
  updateCategory,
  removeCategory,
  listCategory,
  readCategory,
} = require("../controllers/categoryController");

router.route("/").post(createCategory);
router.route("/:categoryId").put(updateCategory);
router.route("/:categoryId").delete(removeCategory);
router.route("/").get(listCategory);
router.route("/:categoryId").get(readCategory);

module.exports = router;
