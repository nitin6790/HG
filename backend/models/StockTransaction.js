const mongoose = require("mongoose");

const stockTransactionSchema = new mongoose.Schema(
  {
    type: { 
      type: String, 
      enum: ["IN", "OUT"], 
      required: true 
    },
    item: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Item", 
      required: true 
    },
    warehouse: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Warehouse", 
      required: true 
    },
    quantity: { 
      type: Number, 
      required: true 
    },
    date: { 
      type: Date, 
      default: Date.now 
    },
    notes: { 
      type: String, 
      default: "" 
    },
  },
  { 
    timestamps: true 
  }
);

// Create indexes for fast report queries
stockTransactionSchema.index({ warehouse: 1, date: 1 });
stockTransactionSchema.index({ item: 1, date: 1 });

module.exports = mongoose.model("StockTransaction", stockTransactionSchema);
