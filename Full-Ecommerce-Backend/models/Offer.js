const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    type: { 
      type: String, 
      enum: ["coupon", "discount"], 
      required: true 
    },
    discountType: { 
      type: String, 
      enum: ["percentage", "value"], 
      required: true 
    },
    discountValue: { 
      type: Number, 
      required: true, 
      min: 0 
    },
    discountCode: {
      type: String,
      trim: true,
      default: ""
    },
    products: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Product", 
      required: true 
    }],
    startDate: { 
      type: Date, 
      required: true 
    },
    endDate: { 
      type: Date, 
      required: true 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    couponApplyTo: {
      type: String,
      enum: ["first", "lowest", "highest"],
      default: "first",
      // Only relevant for type: "coupon"
      // "first": Apply to the first eligible item in the cart
      // "lowest": Apply to the eligible item with the lowest price
      // "highest": Apply to the eligible item with the highest price
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Offer", offerSchema);

