const express = require("express");
const router = express.Router();
const Category = require("../models/Category");

// Get all categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single category
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create category
router.post("/", async (req, res) => {
  const category = new Category({
    name: req.body.name,
    description: req.body.description || "",
  });

  try {
    const newCategory = await category.save();
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update category
router.put("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (req.body.name) category.name = req.body.name;
    if (req.body.description) category.description = req.body.description;

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete category
router.delete("/:id", async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json({ message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
