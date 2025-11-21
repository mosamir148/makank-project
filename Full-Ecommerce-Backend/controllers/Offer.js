const Offer = require("../models/Offer");
const Product = require("../models/Product");

// Create a new offer
exports.createOffer = async (req, res) => {
  try {
    const { name, type, discountType, discountValue, discountCode, products, startDate, endDate } = req.body;

    // Validate required fields
    if (!name || !type || !discountType || discountValue === undefined || !products || !Array.isArray(products) || products.length === 0 || !startDate || !endDate) {
      return res.status(400).json({ 
        message: "name, type, discountType, discountValue, products (array), startDate, and endDate are required" 
      });
    }

    // Validate type
    if (!["coupon", "discount"].includes(type)) {
      return res.status(400).json({ message: "type must be either 'coupon' or 'discount'" });
    }

    // Validate discountType
    if (!["percentage", "value"].includes(discountType)) {
      return res.status(400).json({ message: "discountType must be either 'percentage' or 'value'" });
    }

    // Validate products exist
    const existingProducts = await Product.find({ _id: { $in: products } });
    if (existingProducts.length !== products.length) {
      return res.status(400).json({ message: "One or more products not found" });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      return res.status(400).json({ message: "endDate must be after startDate" });
    }

    // Create the offer
    const newOffer = new Offer({
      name,
      type,
      discountType,
      discountValue: parseFloat(discountValue),
      discountCode: discountCode ? discountCode.trim().toUpperCase() : "",
      products,
      startDate: start,
      endDate: end,
    });

    await newOffer.save();
    await newOffer.populate("products", "title price image");

    res.status(201).json({
      status: "Success",
      message: "تم إنشاء العرض بنجاح",
      offer: newOffer
    });
  } catch (err) {
    console.error("Offer creation error:", err);
    res.status(500).json({
      message: "خطأ أثناء إنشاء العرض",
      error: err.message
    });
  }
};

// Get all offers
exports.getAllOffers = async (req, res) => {
  try {
    const offers = await Offer.find()
      .populate("products", "title price image")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "Success",
      offers
    });
  } catch (err) {
    console.error("Error fetching offers:", err);
    res.status(500).json({
      message: "خطأ أثناء جلب العروض",
      error: err.message
    });
  }
};

// Get offer by ID
exports.getOfferById = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id)
      .populate("products", "title price image description");

    if (!offer) {
      return res.status(404).json({ message: "العرض غير موجود" });
    }

    res.status(200).json({
      status: "Success",
      offer
    });
  } catch (err) {
    console.error("Error fetching offer:", err);
    res.status(500).json({
      message: "خطأ أثناء جلب العرض",
      error: err.message
    });
  }
};

// Update offer
exports.updateOffer = async (req, res) => {
  try {
    const { name, type, discountType, discountValue, discountCode, products, startDate, endDate, isActive } = req.body;

    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: "العرض غير موجود" });
    }

    // Validate dates if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start >= end) {
        return res.status(400).json({ message: "endDate must be after startDate" });
      }
    }

    // Validate products if provided
    if (products && Array.isArray(products)) {
      const existingProducts = await Product.find({ _id: { $in: products } });
      if (existingProducts.length !== products.length) {
        return res.status(400).json({ message: "One or more products not found" });
      }
    }

    // Update fields
    if (name !== undefined) offer.name = name;
    if (type !== undefined) offer.type = type;
    if (discountType !== undefined) offer.discountType = discountType;
    if (discountValue !== undefined) offer.discountValue = parseFloat(discountValue);
    if (discountCode !== undefined) offer.discountCode = discountCode ? discountCode.trim().toUpperCase() : "";
    if (products !== undefined) offer.products = products;
    if (startDate !== undefined) offer.startDate = new Date(startDate);
    if (endDate !== undefined) offer.endDate = new Date(endDate);
    if (isActive !== undefined) offer.isActive = isActive;

    await offer.save();
    await offer.populate("products", "title price image");

    res.status(200).json({
      status: "Success",
      message: "تم تحديث العرض بنجاح",
      offer
    });
  } catch (err) {
    console.error("Offer update error:", err);
    res.status(500).json({
      message: "خطأ أثناء تحديث العرض",
      error: err.message
    });
  }
};

// Delete offer
exports.deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: "العرض غير موجود" });
    }

    res.status(200).json({
      status: "Success",
      message: "تم حذف العرض بنجاح"
    });
  } catch (err) {
    console.error("Offer delete error:", err);
    res.status(500).json({
      message: "خطأ أثناء حذف العرض",
      error: err.message
    });
  }
};

// Get active offers
exports.getActiveOffers = async (req, res) => {
  try {
    const now = new Date();
    const offers = await Offer.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    })
      .populate("products", "title category brand description price image shippingPrice supportsDiscount")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "Success",
      offers
    });
  } catch (err) {
    console.error("Error fetching active offers:", err);
    res.status(500).json({
      message: "خطأ أثناء جلب العروض النشطة",
      error: err.message
    });
  }
};

// Validate coupon code (public endpoint)
exports.validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({
        message: "Coupon code is required"
      });
    }

    const now = new Date();
    const couponCode = code.trim().toUpperCase();

    // Find offer with type "coupon" and matching discountCode (case-insensitive search)
    const offer = await Offer.findOne({
      type: "coupon",
      discountCode: { $regex: new RegExp(`^${couponCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i") },
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).populate("products", "_id");

    if (!offer) {
      return res.status(404).json({
        message: "Invalid or expired coupon code"
      });
    }

    // Return coupon data in the format expected by frontend
    res.status(200).json({
      status: "Success",
      coupon: {
        code: offer.discountCode,
        discountType: offer.discountType,
        discountValue: offer.discountValue,
        name: offer.name,
        startDate: offer.startDate,
        endDate: offer.endDate,
        products: offer.products.map(p => p._id.toString()),
        couponApplyTo: offer.couponApplyTo || "first" // Include couponApplyTo configuration
      }
    });
  } catch (err) {
    console.error("Error validating coupon:", err);
    res.status(500).json({
      message: "Error validating coupon code",
      error: err.message
    });
  }
};

