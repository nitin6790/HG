const express = require("express");
const router = express.Router();
const Item = require("../models/Item");

// Get all items
router.get("/", async (req, res) => {
  try {
    const items = await Item.find()
      .populate("categoryId")
      .populate("warehouseId");
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get items by warehouse
router.get("/warehouse/:warehouseId", async (req, res) => {
  try {
    const items = await Item.find({ warehouseId: req.params.warehouseId })
      .populate("categoryId")
      .populate("warehouseId");
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single item
router.get("/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate("categoryId")
      .populate("warehouseId");
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create item
router.post("/", async (req, res) => {
  // Validate required fields
  if (!req.body.name || !req.body.categoryId || !req.body.warehouseId) {
    return res.status(400).json({ 
      message: "name, categoryId, and warehouseId are required" 
    });
  }

  const item = new Item({
    name: req.body.name,
    categoryId: req.body.categoryId,
    warehouseId: req.body.warehouseId,
    quantity: req.body.quantity || 0,
    inDates: req.body.inDates || [],
    inQuantities: req.body.inQuantities || [],
    outDates: req.body.outDates || [],
    outQuantities: req.body.outQuantities || [],
  });

  try {
    const newItem = await item.save();
    // Fetch and populate the saved item
    const populatedItem = await Item.findById(newItem._id)
      .populate("categoryId")
      .populate("warehouseId");
    res.status(201).json(populatedItem);
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({ 
        message: "An item with this name already exists in the selected warehouse" 
      });
    }
    res.status(400).json({ message: error.message });
  }
});

// Update item
router.put("/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (req.body.name) item.name = req.body.name;
    if (req.body.quantity !== undefined) item.quantity = req.body.quantity;
    if (req.body.inDates) item.inDates = req.body.inDates;
    if (req.body.inQuantities) item.inQuantities = req.body.inQuantities;
    if (req.body.outDates) item.outDates = req.body.outDates;
    if (req.body.outQuantities) item.outQuantities = req.body.outQuantities;

    const updatedItem = await item.save();
    const populatedItem = await updatedItem
      .populate("categoryId")
      .populate("warehouseId");
    res.json(populatedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Stock in
router.post("/:id/stock-in", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    const { quantity, date } = req.body;
    item.quantity += quantity;
    item.inDates.push(new Date(date || Date.now()));
    item.inQuantities.push(quantity);

    const updatedItem = await item.save();
    // Fetch and populate the updated item
    const populatedItem = await Item.findById(updatedItem._id)
      .populate("categoryId")
      .populate("warehouseId");
    res.json(populatedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Stock out
router.post("/:id/stock-out", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    const { quantity, date } = req.body;
    if (item.quantity < quantity) {
      return res
        .status(400)
        .json({ message: "Insufficient quantity in stock" });
    }

    item.quantity -= quantity;
    item.outDates.push(new Date(date || Date.now()));
    item.outQuantities.push(quantity);

    const updatedItem = await item.save();
    // Fetch and populate the updated item
    const populatedItem = await Item.findById(updatedItem._id)
      .populate("categoryId")
      .populate("warehouseId");
    res.json(populatedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete item
router.delete("/:id", async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json({ message: "Item deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
