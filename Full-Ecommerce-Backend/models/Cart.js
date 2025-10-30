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
    },
    featuredProduct: {
      type:  mongoose.Schema.Types.ObjectId,
      ref: "FeaturedProduct",
    },
    onlineProduct: {
      type:  mongoose.Schema.Types.ObjectId,
      ref: "OnlineProduct",
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



module.exports = mongoose.model("Cart", cartSchema);
