const mongoose = require("mongoose");

// Schema for order items
const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  quantity: {
    type: Number,
    default: 1,
    required: true,
  },
  unitPrice: {
    type: Number,
    required: true,
  },
  discountApplied: {
    type: Number,
    default: 0,
  },
  couponDiscount: {
    type: Number,
    default: 0,
  },
  finalPrice: {
    type: Number,
    required: true,
  },
}, { _id: false });

const cartSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      // Don't set unique here - we'll create the index separately to avoid duplicate
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WithoutRegister", 
    },
    // For backward compatibility - single product fields
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
    quantity: {
      type: Number,
      default: 1,
    },
    // New: Array of items for orders with multiple products
    items: [orderItemSchema],
    couponCode: { type: String },
    discount: { type: Number, default: 0 }, // Legacy field for backward compatibility
    couponDiscount: { type: Number, default: 0 }, // Renamed from discount
    deliveryFee: { type: Number, default: 0 }, // Delivery fee (default 0)
    paymentMethod: { type: String, default: "Cash" },
    // Delivery address (can be reference or embedded)
    deliveryAddress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryAddress",
    },
    // Or store delivery address directly for guest orders
    deliveryAddressInfo: {
      name: String,
      phone: String,
      city: String,
      governorate: String,
      street: String,
      number: String,
      buildingNumber: String,
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted & Processed", "Delivered", "Completed", "Rejected", "Cancelled"],
      default: "Pending", 
    },
    // Tracking token for anonymous users to track their orders
    trackingToken: {
      type: String,
      unique: true,
      sparse: true, // Only enforce uniqueness when trackingToken exists
    },
  },
  { timestamps: true }
);

// SIMPLIFIED: No unique indexes on product fields
// Duplicate prevention is handled in application logic (controllers)
// This allows:
// 1. Multiple orders with items array (product fields are null)
// 2. Multiple single-product cart items (handled by checking before creating)

// Only keep unique index on orderNumber for orders
cartSchema.index(
  { orderNumber: 1 },
  { 
    unique: true, 
    sparse: true // Only enforce uniqueness when orderNumber exists
  }
);

// Index for tracking token (for anonymous order tracking)
cartSchema.index(
  { trackingToken: 1 },
  { 
    unique: true, 
    sparse: true // Only enforce uniqueness when trackingToken exists
  }
);

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
