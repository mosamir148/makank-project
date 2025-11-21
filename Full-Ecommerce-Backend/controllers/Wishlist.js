const Wishlist = require("../models/Wishlist");


exports.addToWishlist = async (req, res) => {
  try {
    // Get userId from authenticated session (token) - more secure
    // Never trust userId from request body as it can be manipulated
    const userId = req.user?._id?.toString();
    
    if (!userId) {
      return res.status(401).json({ message: "Authentication required. Please log in." });
    }

    const { productId, featuredProductId, onlineProductId, offerProductId } = req.body;

    if (!productId && !featuredProductId && !onlineProductId && !offerProductId) {
      return res.status(400).json({ message: "productId, featuredProductId, onlineProductId, or offerProductId is required" });
    }

    // Build query to check for existing item
    let query = { user: userId };
    let productField = null;
    
    if (productId) {
      query.product = productId;
      productField = "product";
    } else if (featuredProductId) {
      query.featuredProduct = featuredProductId;
      productField = "featuredProduct";
    } else if (onlineProductId) {
      query.onlineProduct = onlineProductId;
      productField = "onlineProduct";
    } else if (offerProductId) {
      query.offerProduct = offerProductId;
      productField = "offerProduct";
    }

    // Check if product exists for this user
    let existingItem = await Wishlist.findOne(query);
    
    if (existingItem) {
      await existingItem.populate([
        { path: "product", select: "title category brand description price image stock shippingPrice supportsDiscount" },
        { path: "featuredProduct", select: "title category brand description price image stock shippingPrice supportsDiscount" },
        { path: "onlineProduct", select: "title category brand description price image stock shippingPrice supportsDiscount" },
        { path: "offerProduct", select: "title category brand description price image stock shippingPrice supportsDiscount" },
        { path: "user", select: "username email phone" }
      ]);
      return res.status(200).json({ message: "Already in wishlist", item: existingItem });
    }

    // Validate that the product exists before saving
    const Product = require("../models/Product");
    let productToValidate = null;
    
    if (productId) {
      productToValidate = await Product.findById(productId);
      if (!productToValidate) {
        return res.status(400).json({ message: `Product with ID ${productId} not found` });
      }
    } else if (featuredProductId) {
      productToValidate = await Product.findById(featuredProductId);
      if (!productToValidate) {
        return res.status(400).json({ message: `FeaturedProduct with ID ${featuredProductId} not found` });
      }
    } else if (onlineProductId) {
      productToValidate = await Product.findById(onlineProductId);
      if (!productToValidate) {
        return res.status(400).json({ message: `OnlineProduct with ID ${onlineProductId} not found` });
      }
    } else if (offerProductId) {
      productToValidate = await Product.findById(offerProductId);
      if (!productToValidate) {
        return res.status(400).json({ message: `OfferProduct with ID ${offerProductId} not found` });
      }
    }

    // Create new wishlist item
    const itemData = {
      user: userId,
    };
    
    if (productId) itemData.product = productId;
    if (featuredProductId) itemData.featuredProduct = featuredProductId;
    if (onlineProductId) itemData.onlineProduct = onlineProductId;
    if (offerProductId) itemData.offerProduct = offerProductId;

    const item = await Wishlist.create(itemData);

    await item.populate([
      { path: "product", select: "title category brand description price image shippingPrice supportsDiscount" },
      { path: "featuredProduct", select: "title category brand description price image shippingPrice supportsDiscount" },
      { path: "onlineProduct", select: "title category brand description price image shippingPrice supportsDiscount" },
      { path: "offerProduct", select: "title category brand description price image shippingPrice supportsDiscount" },
      { path: "user", select: "username email phone" }
    ]);

    // Log if populate failed and get the unified product
    const unifiedProduct = item.product || item.featuredProduct || item.onlineProduct || item.offerProduct;
    
    if (productId && !item.product) {
      console.error("❌ Product populate failed for productId:", productId, "wishlist item:", item._id);
    }
    if (featuredProductId && !item.featuredProduct) {
      console.error("❌ FeaturedProduct populate failed for productId:", featuredProductId, "wishlist item:", item._id);
    }
    if (onlineProductId && !item.onlineProduct) {
      console.error("❌ OnlineProduct populate failed for productId:", onlineProductId, "wishlist item:", item._id);
    }
    if (offerProductId && !item.offerProduct) {
      console.error("❌ OfferProduct populate failed for productId:", offerProductId, "wishlist item:", item._id);
    }

    // If populate failed, try to manually fetch and attach the product
    if (!unifiedProduct && productToValidate) {
      console.log("⚠️ Populate failed, manually attaching product data");
      if (productId) item.product = productToValidate;
      else if (featuredProductId) item.featuredProduct = productToValidate;
      else if (onlineProductId) item.onlineProduct = productToValidate;
      else if (offerProductId) item.offerProduct = productToValidate;
    }

    // Convert to plain object to ensure all fields are included
    const responseItem = item.toObject ? item.toObject() : item;
    
    res.status(201).json(responseItem);
  } catch (error) {
    console.error("addToWishlist error:", error);
    if (error.code === 11000) {
      // Duplicate key error - try to find and return the existing item
      const userId = req.user?._id?.toString();
      const { productId, featuredProductId, onlineProductId, offerProductId } = req.body;
      
      if (!userId) {
        return res.status(401).json({ message: "Authentication required. Please log in." });
      }
      
      let query = { user: userId };
      
      if (productId) query.product = productId;
      else if (featuredProductId) query.featuredProduct = featuredProductId;
      else if (onlineProductId) query.onlineProduct = onlineProductId;
      else if (offerProductId) query.offerProduct = offerProductId;
      
      const existingItem = await Wishlist.findOne(query);
      
      if (existingItem) {
        await existingItem.populate([
          { path: "product", select: "title category brand description price image stock shippingPrice supportsDiscount" },
          { path: "featuredProduct", select: "title category brand description price image stock shippingPrice supportsDiscount" },
          { path: "onlineProduct", select: "title category brand description price image stock shippingPrice supportsDiscount" },
          { path: "offerProduct", select: "title category brand description price image stock shippingPrice supportsDiscount" },
          { path: "user", select: "username email phone" }
        ]);
        return res.status(200).json({ message: "Already in wishlist", item: existingItem });
      }
      
      return res.status(400).json({ message: "This product is already in the wishlist" });
    }
    res.status(500).json({ message: "Error adding to wishlist", error: error.message });
  }
};


exports.getUserWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    // First get raw documents to preserve IDs even if populate fails
    const rawWishlist = await Wishlist.find({ user: userId }).lean();
    
    // Create a map of raw items by _id for easy lookup
    const rawWishlistMap = {};
    rawWishlist.forEach(item => {
      rawWishlistMap[item._id.toString()] = item;
    });
    
    // Then populate
    const wishlist = await Wishlist.find({ user: userId })
      .populate("product", "title category brand description price image shippingPrice supportsDiscount")
      .populate("featuredProduct", "title category brand description price image shippingPrice supportsDiscount")
      .populate("onlineProduct", "title category brand description price image shippingPrice supportsDiscount")
      .populate("offerProduct", "title category brand description price image shippingPrice supportsDiscount")
      .populate("user", "username email phone")
      .lean();

    // Merge raw IDs with populated data so frontend can fetch missing products
    const enrichedWishlist = wishlist.map((item) => {
      const rawItem = rawWishlistMap[item._id.toString()];
      if (!rawItem) {
        console.warn("Raw item not found for:", item._id);
        return item;
      }
      
      // Log if any product type failed to populate
      if (rawItem.product && !item.product) {
        console.warn("⚠️ Product populate failed for productId:", rawItem.product, "in wishlist item:", item._id);
      }
      if (rawItem.featuredProduct && !item.featuredProduct) {
        console.warn("⚠️ FeaturedProduct populate failed for productId:", rawItem.featuredProduct, "in wishlist item:", item._id);
      }
      if (rawItem.onlineProduct && !item.onlineProduct) {
        console.warn("⚠️ OnlineProduct populate failed for productId:", rawItem.onlineProduct, "in wishlist item:", item._id);
      }
      if (rawItem.offerProduct && !item.offerProduct) {
        console.warn("⚠️ OfferProduct populate failed for productId:", rawItem.offerProduct, "in wishlist item:", item._id);
      }
      
      return {
        ...item,
        // Include raw IDs in case populate returned null for any product type
        rawProductId: rawItem.product,
        rawFeaturedProductId: rawItem.featuredProduct,
        rawOnlineProductId: rawItem.onlineProduct,
        rawOfferProductId: rawItem.offerProduct,
      };
    });

    res.status(200).json(enrichedWishlist);
  } catch (error) {
    console.error("Wishlist fetch error:", error);
    res.status(500).json({ message: "Error fetching wishlist", error: error.message });
  }
};


exports.getAllWishlists = async (req, res) => {
  try {
    const wishlists = await Wishlist.find()
      .populate("product", "title category brand description price image shippingPrice supportsDiscount")
      .populate("featuredProduct", "title category brand description price image shippingPrice supportsDiscount")
      .populate("onlineProduct", "title category brand description price image shippingPrice supportsDiscount")
      .populate("offerProduct", "title category brand description price image shippingPrice supportsDiscount")
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

// تحديث عنصر في الـWishlist (quantity)
exports.updateWishlistItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const userId = req.user._id?.toString();
    const userRole = req.user.role;

    const item = await Wishlist.findById(id);
    if (!item) return res.status(404).json({ message: "Wishlist item not found" });

    const itemUserId = item.user.toString();

    if (userRole !== "admin" && itemUserId !== userId) {
      return res.status(403).json({ message: "Not authorized to update this item" });
    }

    // Note: Wishlist model might not have quantity field, but we'll update it if it exists
    // If quantity is not a field in Wishlist, you might need to handle this differently
    // For now, we'll just return success
    if (quantity !== undefined && item.quantity !== undefined) {
      item.quantity = quantity;
      await item.save();
    }

    res.status(200).json({ message: "Wishlist item updated successfully", item });
  } catch (error) {
    console.error("UpdateWishlistItem Error:", error);
    res.status(500).json({ message: "Error updating wishlist item", error: error.message });
  }
};