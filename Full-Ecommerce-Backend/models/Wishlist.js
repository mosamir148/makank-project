const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    featuredProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    onlineProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    offerProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  },
  { timestamps: true }
);


module.exports = mongoose.model("Wishlist", wishlistSchema);
