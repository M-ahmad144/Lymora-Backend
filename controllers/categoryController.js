const asyncHandler = require("../middlewares/asyncHandler");
const Category = require("../models/categoryModel");

const createCategory = asyncHandler(async (req, res) => {
  console.log(req.body);
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: "Name is required" });
  }
  const existingCategory = await Category.findOne({ name });
  if (existingCategory) {
    return res.status(409).json({ message: "Category already exists" });
  }
  const category = await new Category({ name }).save();
  res.status(201).json(category);
});

const updateCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const { categoryId } = req.params;

  const category = await Category.findById({ _id: categoryId });
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  category.name = name;
  const updatedCategory = await category.save();
  res.status(200).json(updatedCategory);
});

const removeCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  const removed = await Category.findByIdAndDelete({ _id: categoryId });
  if (!removed) {
    return res.status(404).json({ message: "Category not found" });
  }

  res.status(200).json({ message: "Category removed successfully", removed });
});

const listCategory = asyncHandler(async (req, res) => {
  try {
    const allCategories = await Category.find({});
    res.status(200).json(allCategories);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

const readCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  const category = await Category.findById({ _id: categoryId });
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  res.status(200).json(category);
});

module.exports = {
  createCategory,
  updateCategory,
  removeCategory,
  listCategory,
  readCategory,
};
