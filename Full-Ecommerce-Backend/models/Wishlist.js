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
    FeaturedProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeaturedProduct",
    },
    onlineProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OnlineProduct",
    },
  },
  { timestamps: true }
);


// فقط للمنتج العادي
wishlistSchema.index(
  { user: 1, product: 1 },
  { unique: true, partialFilterExpression: { product: { $type: "objectId" } } }
);

// فقط للمنتج المميز
wishlistSchema.index(
  { user: 1, FeaturedProduct: 1 },
  { unique: true, partialFilterExpression: { FeaturedProduct: { $type: "objectId" } } }
);

// فقط للمنتج الأونلاين
wishlistSchema.index(
  { user: 1, onlineProduct: 1 },
  { unique: true, partialFilterExpression: { onlineProduct: { $type: "objectId" } } }
);


module.exports = mongoose.model("Wishlist", wishlistSchema);
