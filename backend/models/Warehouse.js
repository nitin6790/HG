const mongoose = require("mongoose");

const warehouseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    location: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Warehouse", warehouseSchema);
