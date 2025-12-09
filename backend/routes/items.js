const express = require("express");
const router = express.Router();
const Item = require("../models/Item");
const StockTransaction = require("../models/StockTransaction");

// Get all items with optional filters
// GET /api/items?warehouseId=X&categoryId=Y&search=Z
router.get("/", async (req, res) => {
  try {
    const { warehouseId, categoryId, search } = req.query;
    let filter = {};

    // Add filters if provided
    if (warehouseId) {
      filter.warehouseId = warehouseId;
    }
    if (categoryId) {
      filter.categoryId = categoryId;
    }
    if (search) {
      // Case-insensitive partial match on name
      filter.name = { $regex: search, $options: "i" };
    }

    const items = await Item.find(filter)
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

// Create or Stock In item (upsert logic)
// POST /api/items
// Body: { name, categoryId, warehouseId, quantity, notes }
router.post("/", async (req, res) => {
  // Validate required fields
  if (!req.body.name || !req.body.categoryId || !req.body.warehouseId) {
    return res.status(400).json({ 
      message: "name, categoryId, and warehouseId are required" 
    });
  }

  if (!req.body.quantity || req.body.quantity <= 0) {
    return res.status(400).json({ 
      message: "quantity must be greater than 0" 
    });
  }

  try {
    const { name, categoryId, warehouseId, quantity, notes } = req.body;

    // 1) Try to find existing item for this name + warehouse
    let item = await Item.findOne({
      name: name.trim(),
      warehouseId: warehouseId,
    });

    if (item) {
      // 2) If exists → increment quantity (stock in)
      item.quantity += Number(quantity);
      if (notes) item.notes = notes;
      await item.save();
    } else {
      // 3) If not exists → create new item
      item = await Item.create({
        name: name.trim(),
        categoryId,
        warehouseId,
        quantity: Number(quantity),
        notes: notes || "",
      });
    }

    // 4) Create stock transaction record for auditing
    await StockTransaction.create({
      type: "IN",
      item: item._id,
      warehouse: warehouseId,
      quantity: Number(quantity),
      date: new Date(),
      notes: notes || "",
    });

    // 5) Populate and return
    const populatedItem = await Item.findById(item._id)
      .populate("categoryId")
      .populate("warehouseId");

    res.status(201).json(populatedItem);
  } catch (error) {
    console.error("Create/Stock In error:", error);
    // Handle any other errors
    res.status(400).json({ message: error.message || "Failed to create/stock in item" });
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
    if (req.body.notes) item.notes = req.body.notes;

    const updatedItem = await item.save();
    const populatedItem = await Item.findById(updatedItem._id)
      .populate("categoryId")
      .populate("warehouseId");
    res.json(populatedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Stock in (explicit endpoint for consistency)
// POST /api/items/:id/stock-in
// Body: { quantity, notes, date }
router.post("/:id/stock-in", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    const { quantity, notes, date } = req.body;
    
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ 
        message: "quantity must be greater than 0" 
      });
    }

    // Increment quantity
    item.quantity += Number(quantity);

    const updatedItem = await item.save();

    // Create stock transaction record
    await StockTransaction.create({
      type: "IN",
      item: item._id,
      warehouse: item.warehouseId,
      quantity: Number(quantity),
      date: new Date(date || Date.now()),
      notes: notes || "",
    });

    // Populate and return
    const populatedItem = await Item.findById(updatedItem._id)
      .populate("categoryId")
      .populate("warehouseId");

    res.json(populatedItem);
  } catch (error) {
    console.error("Stock In error:", error);
    res.status(400).json({ message: error.message });
  }
});

// Stock out
// POST /api/items/:id/stock-out
// Body: { quantity, notes, date }
router.post("/:id/stock-out", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    const { quantity, notes, date } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ 
        message: "quantity must be greater than 0" 
      });
    }

    if (item.quantity < quantity) {
      return res.status(400).json({ 
        message: `Insufficient quantity in stock. Available: ${item.quantity}, Requested: ${quantity}` 
      });
    }

    // Decrement quantity
    item.quantity -= Number(quantity);

    const updatedItem = await item.save();

    // Create stock transaction record
    await StockTransaction.create({
      type: "OUT",
      item: item._id,
      warehouse: item.warehouseId,
      quantity: Number(quantity),
      date: new Date(date || Date.now()),
      notes: notes || "",
    });

    // Populate and return
    const populatedItem = await Item.findById(updatedItem._id)
      .populate("categoryId")
      .populate("warehouseId");

    res.json(populatedItem);
  } catch (error) {
    console.error("Stock Out error:", error);
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
    
    // Also delete related transactions
    await StockTransaction.deleteMany({ item: req.params.id });
    
    res.json({ message: "Item deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== STOCK IN/OUT ENDPOINTS ====================

// Stock In - Dedicated endpoint
// POST /api/stock/in
// Body: { name, categoryId, warehouseId, quantity, notes }
router.post("/stock/in", async (req, res) => {
  if (!req.body.name || !req.body.categoryId || !req.body.warehouseId) {
    return res.status(400).json({ 
      message: "name, categoryId, and warehouseId are required" 
    });
  }

  if (!req.body.quantity || req.body.quantity <= 0) {
    return res.status(400).json({ 
      message: "quantity must be greater than 0" 
    });
  }

  try {
    const { name, categoryId, warehouseId, quantity, notes } = req.body;

    // Find existing item or create new
    let item = await Item.findOne({
      name: name.trim(),
      warehouseId: warehouseId,
    });

    if (item) {
      // Item exists: increment quantity
      item.quantity += Number(quantity);
      if (notes) item.notes = notes;
      await item.save();
    } else {
      // Item doesn't exist: create new
      item = await Item.create({
        name: name.trim(),
        categoryId,
        warehouseId,
        quantity: Number(quantity),
        notes: notes || "",
      });
    }

    // Create stock transaction record
    await StockTransaction.create({
      type: "IN",
      item: item._id,
      warehouse: warehouseId,
      quantity: Number(quantity),
      date: new Date(),
      notes: notes || "",
    });

    // Populate and return
    const populatedItem = await Item.findById(item._id)
      .populate("categoryId")
      .populate("warehouseId");

    res.status(201).json(populatedItem);
  } catch (error) {
    console.error("Stock In error:", error);
    res.status(400).json({ message: error.message || "Failed to stock in item" });
  }
});

// Stock Out - Dedicated endpoint
// POST /api/stock/out
// Body: { name, warehouseId, quantity, notes }
router.post("/stock/out", async (req, res) => {
  if (!req.body.name || !req.body.warehouseId) {
    return res.status(400).json({ 
      message: "name and warehouseId are required" 
    });
  }

  if (!req.body.quantity || req.body.quantity <= 0) {
    return res.status(400).json({ 
      message: "quantity must be greater than 0" 
    });
  }

  try {
    const { name, warehouseId, quantity, notes } = req.body;

    // Find item by name + warehouse
    const item = await Item.findOne({
      name: name.trim(),
      warehouseId: warehouseId,
    });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Check if sufficient quantity
    if (item.quantity < quantity) {
      return res.status(400).json({ 
        message: `Insufficient quantity in stock. Available: ${item.quantity}, Requested: ${quantity}` 
      });
    }

    // Decrement quantity
    item.quantity -= Number(quantity);
    await item.save();

    // Create stock transaction record
    await StockTransaction.create({
      type: "OUT",
      item: item._id,
      warehouse: warehouseId,
      quantity: Number(quantity),
      date: new Date(),
      notes: notes || "",
    });

    // Populate and return
    const populatedItem = await Item.findById(item._id)
      .populate("categoryId")
      .populate("warehouseId");

    res.status(200).json(populatedItem);
  } catch (error) {
    console.error("Stock Out error:", error);
    res.status(400).json({ message: error.message || "Failed to stock out item" });
  }
});

module.exports = router;

