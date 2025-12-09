const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },
    quantity: {
      type: Number,
      default: 0,
    },
    inDates: [
      {
        type: Date,
      },
    ],
    inQuantities: [
      {
        type: Number,
      },
    ],
    outDates: [
      {
        type: Date,
      },
    ],
    outQuantities: [
      {
        type: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create unique compound index on name + warehouseId
itemSchema.index({ name: 1, warehouseId: 1 }, { unique: true });

module.exports = mongoose.model("Item", itemSchema);
