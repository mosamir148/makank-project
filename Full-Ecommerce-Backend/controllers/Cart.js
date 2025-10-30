const Cart = require("../models/Cart");
const WithoutRegister = require("../models/WithoutRegister");
exports.addToCart = async (req, res) => {
  try {
    const {
      userId,
      guestId,
      productId,
      featuredProductId,
      offerProductId,
      onlineProductId,
      quantity,
      couponCode,
      discount,
    } = req.body;

    if (!productId && !featuredProductId && !onlineProductId && !offerProductId) {
      return res
        .status(400)
        .json({ message: "Product ID, FeaturedProduct ID or OnlineProduct ID is required" });
    }

    if (!userId && !guestId) {
      return res.status(400).json({ message: "userId or guestId is required" });
    }

    let query = {};
    if (productId) query.product = productId;
    if (featuredProductId) query.featuredProduct = featuredProductId;
    if (onlineProductId) query.onlineProduct = onlineProductId;
    if (offerProductId) query.offerProduct = offerProductId;
    if (userId) query.user = userId;
    if (guestId) query.guest = guestId;

    let cartItem = await Cart.findOne(query);

    if (cartItem) {
      cartItem.quantity += quantity || 1;
      if (couponCode) cartItem.couponCode = couponCode;
      if (discount) cartItem.discount = discount;
      await cartItem.save();
    } else {
      cartItem = await Cart.create({
        user: userId || undefined,
        guest: guestId || undefined,
        product: productId || undefined,
        featuredProduct: featuredProductId || undefined,
        onlineProduct: onlineProductId || undefined,
        offerProduct: offerProductId || undefined,
        quantity: quantity || 1,
        status: "Pending",
        couponCode: couponCode || null,
        discount: discount || 0,
      });
    }

    await cartItem.populate([
      { path: "product", select: "title description brand category price image" },
      { path: "featuredProduct", select: "title description brand category price image" },
      { path: "onlineProduct", select: "title description brand category price image" },
      { path: "offerProduct", select: "title description brand category price image startDate endDate" },
      { path: "user", select: "username email phone" },
      { path: "guest", select: "username email phone address" },
    ]);

    const unifiedProduct =
      cartItem.product ||
      cartItem.featuredProduct ||
      cartItem.onlineProduct ||
      cartItem.offerProduct ||
      null;

    // ✅ حساب السعر النهائي بعد الخصم
    let finalPrice = unifiedProduct?.price || 0;
    if (cartItem.discount > 0) {
      finalPrice = finalPrice - (finalPrice * cartItem.discount) / 100;
    }

    res.status(201).json({
      _id: cartItem._id,
      user: cartItem.user,
      guest: cartItem.guest,
      quantity: cartItem.quantity,
      status: cartItem.status,
      createdAt: cartItem.createdAt,
      updatedAt: cartItem.updatedAt,
      product: unifiedProduct,
      couponCode: cartItem.couponCode || null,
      discount: cartItem.discount || 0,
      finalPrice,
    });
  } catch (error) {
    console.error("addToCart error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "This product is already in the cart" });
    }
    res.status(500).json({ message: "Error adding to cart", error: error.message });
  }
};

// جلب كارت المستخدم
exports.getUserCart = async (req, res) => {
  try {
    const userId = req.user._id;

    let cart = await Cart.find({ user: userId })
      .populate("product", "title description brand category price image")
      .populate("featuredProduct", "title description brand category price image")
      .populate("onlineProduct", "title description brand category price image")
      .populate("offerProduct", "title description brand category price image startDate endDate")
      .populate("user", "username email phone");

    cart = cart.map((item) => {
      const product =
        item.product || item.featuredProduct || item.onlineProduct || item.offerProduct || null;

      let finalPrice = product?.price || 0;
      if (item.discount > 0) {
        finalPrice = finalPrice - (finalPrice * item.discount) / 100;
      }

      return {
        _id: item._id,
        user: item.user,
        guest: item.guest,
        quantity: item.quantity,
        status: item.status,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        product,
        couponCode: item.couponCode || null,
        discount: item.discount || 0,
        finalPrice,
      };
    });

    res.status(200).json(cart);
  } catch (error) {
    console.error("Cart fetch error:", error);
    res.status(500).json({ message: "Error fetching cart", error: error.message });
  }
};

// جلب كل الكارتات (للأدمن)
exports.getAllCarts = async (req, res) => {
  try {
    let carts = await Cart.find()
      .populate("product", "title description brand category price image")
      .populate("featuredProduct", "title description brand category price image")
      .populate("onlineProduct", "title description brand category price image")
      .populate("offerProduct", "title description brand category price image startDate endDate")
      .populate("user", "username email phone address")
      .populate("guest", "username email phone address");

    carts = carts.map((item) => {
      const product =
        item.product || item.featuredProduct || item.onlineProduct || item.offerProduct || null;

      let finalPrice = product?.price || 0;
      if (item.discount > 0) {
        finalPrice = finalPrice - (finalPrice * item.discount) / 100;
      }

      return {
        _id: item._id,
        user: item.user,
        guest: item.guest,
        quantity: item.quantity,
        status: item.status,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        product,
        couponCode: item.couponCode || null,
        discount: item.discount || 0,
        finalPrice,
      };
    });

    res.status(200).json(carts);
  } catch (error) {
    console.error("Error fetching carts:", error);
    res.status(500).json({ message: "Error fetching carts", error: error.message });
  }
};

// تحديث كمية أو حالة المنتج في الكارت
exports.updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, status } = req.body;

    const updatedItem = await Cart.findByIdAndUpdate(
      id,
      { quantity, ...(status && { status }) },
      { new: true }
    );

    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: "Error updating cart item", error });
  }
};


// حذف عنصر من الكارت
exports.deleteCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id?.toString() || req.user.id?.toString();
    const userRole = req.user.role;

    const cartItem = await Cart.findById(id);

    if (!cartItem) return res.status(404).json({ message: "Cart item not found" });

    const cartUserId = cartItem.user?.toString();
    if (userRole !== "admin" && cartUserId !== userId)
      return res.status(403).json({ message: "Not authorized to delete this item" });

    await Cart.findByIdAndDelete(id);

    res.status(200).json({ message: "Item removed from cart" });
  } catch (error) {
    console.error("DeleteCartItem Error:", error);
    res.status(500).json({ message: "Error deleting cart item", error });
  }
};
