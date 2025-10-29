const Wishlist = require("../models/Wishlist");

// إضافة منتج للـWishlist (عادي، مميز، أو أونلاين)
exports.addToWishlist = async (req, res) => {
  try {
    console.log("Wishlist request body:", req.body);
    const { userId, productId, featuredProductId, onlineProductId } = req.body;

    if (!userId || (!productId && !featuredProductId && !onlineProductId)) {
      return res.status(400).json({ message: "userId and at least one productId are required" });
    }

    // query للتحقق من وجود العنصر مسبقًا
    let query = { user: userId };
    if (productId) query.product = productId;
    if (featuredProductId) query.FeaturedProduct = featuredProductId;
    if (onlineProductId) query.onlineProduct = onlineProductId;

    let item = await Wishlist.findOne(query);
    if (item) {
      return res.status(200).json({ message: "Already in wishlist", item });
    }

    item = await Wishlist.create({
      user: userId,
      product: productId || undefined,
      FeaturedProduct: featuredProductId || undefined,
      onlineProduct: onlineProductId || undefined,
    });

    await item.populate("product FeaturedProduct onlineProduct user", "title username email phone");

    res.status(201).json(item);
  } catch (error) {
    console.error("addToWishlist error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "This product is already in the wishlist" });
    }
    res.status(500).json({ message: "Error adding to wishlist", error: error.message });
  }
};

// عرض Wishlist الخاص باليوزر
exports.getUserWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    const wishlist = await Wishlist.find({ user: userId })
      .populate("product", "title category brand description price image")
      .populate("FeaturedProduct", "title category brand description price image")
      .populate("onlineProduct", "title category brand description price image")
      .populate("user", "username email phone");

    res.status(200).json(wishlist);
  } catch (error) {
    console.error("Wishlist fetch error:", error);
    res.status(500).json({ message: "Error fetching wishlist", error: error.message });
  }
};

// عرض كل الـWishlists (لـAdmin)
exports.getAllWishlists = async (req, res) => {
  try {
    const wishlists = await Wishlist.find()
      .populate("product")
      .populate("FeaturedProduct")
      .populate("onlineProduct")
      .populate("user", "username email phone");

    res.status(200).json(wishlists);
  } catch (error) {
    res.status(500).json({ message: "Error fetching all wishlists", error });
  }
};

// حذف عنصر من الـWishlist
exports.deleteWishlistItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id?.toString();
    const userRole = req.user.role;

    const item = await Wishlist.findById(id);
    if (!item) return res.status(404).json({ message: "Wishlist item not found" });

    const itemUserId = item.user.toString();

    if (userRole !== "admin" && itemUserId !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this item" });
    }

    await Wishlist.findByIdAndDelete(id);
    res.status(200).json({ message: "Item removed from wishlist" });
  } catch (error) {
    console.error("DeleteWishlistItem Error:", error);
    res.status(500).json({ message: "Error deleting wishlist item", error });
  }
};
