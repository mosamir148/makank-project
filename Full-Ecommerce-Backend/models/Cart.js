const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WithoutRegister", 
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ["Pending", "Complete", "Failed"],
      default: "Pending", 
    },
  },
  { timestamps: true }
);

// فهرس فريد لكل user + product
cartSchema.index({ user: 1, product: 1 }, { unique: true });

module.exports = mongoose.model("Cart", cartSchema);
