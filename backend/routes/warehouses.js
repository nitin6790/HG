const express = require("express");
const router = express.Router();
const Warehouse = require("../models/Warehouse");

// Get all warehouses
router.get("/", async (req, res) => {
  try {
    const warehouses = await Warehouse.find().populate("items");
    res.json(warehouses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single warehouse
router.get("/:id", async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id).populate("items");
    if (!warehouse) {
      return res.status(404).json({ message: "Warehouse not found" });
    }
    res.json(warehouse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create warehouse
router.post("/", async (req, res) => {
  const warehouse = new Warehouse({
    name: req.body.name,
    location: req.body.location || "",
  });

  try {
    const newWarehouse = await warehouse.save();
    res.status(201).json(newWarehouse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update warehouse
router.put("/:id", async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) {
      return res.status(404).json({ message: "Warehouse not found" });
    }

    if (req.body.name) warehouse.name = req.body.name;
    if (req.body.location) warehouse.location = req.body.location;

    const updatedWarehouse = await warehouse.save();
    res.json(updatedWarehouse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete warehouse
router.delete("/:id", async (req, res) => {
  try {
    const warehouse = await Warehouse.findByIdAndDelete(req.params.id);
    if (!warehouse) {
      return res.status(404).json({ message: "Warehouse not found" });
    }
    res.json({ message: "Warehouse deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
