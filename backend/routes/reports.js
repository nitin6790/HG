const express = require("express");
const router = express.Router();
const Item = require("../models/Item");
const StockTransaction = require("../models/StockTransaction");

// ==================== REPORTS ====================

// Get monthly report for a warehouse and month
// GET /api/reports/monthly?year=2025&month=1&warehouseId=X
// Returns: [{ itemName, categoryName, openingStock, stockIn, stockOut, closingStock }]
router.get("/monthly", async (req, res) => {
  try {
    const { year, month, warehouseId } = req.query;

    // Validate required parameters
    if (!year || !month) {
      return res.status(400).json({ 
        message: "year and month are required" 
      });
    }

    const yearInt = parseInt(year);
    const monthInt = parseInt(month);

    if (isNaN(yearInt) || isNaN(monthInt) || monthInt < 1 || monthInt > 12) {
      return res.status(400).json({ 
        message: "year and month must be valid numbers (month 1-12)" 
      });
    }

    // Build date range for the month
    const startDate = new Date(yearInt, monthInt - 1, 1);
    const endDate = new Date(yearInt, monthInt, 0, 23, 59, 59, 999);

    // Build filter for transactions
    const transactionFilter = {
      date: { $gte: startDate, $lte: endDate }
    };

    if (warehouseId) {
      transactionFilter.warehouse = warehouseId;
    }

    // Get all items for the warehouse(s)
    let itemFilter = {};
    if (warehouseId) {
      itemFilter.warehouseId = warehouseId;
    }

    const items = await Item.find(itemFilter)
      .populate("categoryId")
      .populate("warehouseId");

    // Get transactions for the month
    const transactions = await StockTransaction.find(transactionFilter)
      .populate("item")
      .populate("warehouse");

    // Calculate report for each item
    const reportRows = await Promise.all(
      items.map(async (item) => {
        // Get all transactions for this item (to calculate opening stock)
        const itemTransactions = await StockTransaction.find({ item: item._id });

        // Calculate opening stock (current quantity minus net change this month)
        let stockInThisMonth = 0;
        let stockOutThisMonth = 0;

        itemTransactions.forEach((t) => {
          if (t.date >= startDate && t.date <= endDate) {
            if (t.type === "IN") {
              stockInThisMonth += t.quantity;
            } else if (t.type === "OUT") {
              stockOutThisMonth += t.quantity;
            }
          }
        });

        const openingStock = item.quantity - (stockInThisMonth - stockOutThisMonth);
        const closingStock = item.quantity;

        return {
          itemName: item.name,
          categoryName: item.categoryId ? item.categoryId.name : "Unknown",
          warehouseName: item.warehouseId ? item.warehouseId.name : "Unknown",
          openingStock: Math.max(0, openingStock),
          stockIn: stockInThisMonth,
          stockOut: stockOutThisMonth,
          closingStock: closingStock,
        };
      })
    );

    // Filter out items with no activity (optional, remove if you want all items)
    const activeRows = reportRows.filter(
      (row) => row.openingStock > 0 || row.stockIn > 0 || row.stockOut > 0 || row.closingStock > 0
    );

    res.json(activeRows.length > 0 ? activeRows : reportRows);
  } catch (error) {
    console.error("Monthly report error:", error);
    res.status(500).json({ message: error.message || "Failed to generate monthly report" });
  }
});

// Get low-stock items
// GET /api/reports/low-stock?warehouseId=X&threshold=5
// Returns: [items where quantity < threshold]
router.get("/low-stock", async (req, res) => {
  try {
    const { warehouseId, threshold = 5 } = req.query;
    const thresholdNum = parseInt(threshold) || 5;

    let filter = {
      quantity: { $lt: thresholdNum }
    };

    if (warehouseId) {
      filter.warehouseId = warehouseId;
    }

    const lowStockItems = await Item.find(filter)
      .populate("categoryId")
      .populate("warehouseId")
      .sort({ quantity: 1 });

    res.json(lowStockItems);
  } catch (error) {
    console.error("Low-stock report error:", error);
    res.status(500).json({ message: error.message || "Failed to get low-stock items" });
  }
});

module.exports = router;
