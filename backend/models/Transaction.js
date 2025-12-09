const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["in", "out"],
      required: true,
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Transaction", transactionSchema);
