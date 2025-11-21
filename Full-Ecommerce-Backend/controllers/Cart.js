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

// جلب كارت المستخدم (Active Cart Items - not orders)
exports.getUserCart = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        message: "Unauthorized - User not authenticated",
        error: "User authentication required"
      });
    }
    
    const userId = req.user._id;
    
    console.log("🔍 getUserCart called - userId:", userId);
    
    // Get pagination parameters (optional, for backward compatibility)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 1000; // Default to large limit to get all cart items
    const skip = (page - 1) * limit;

    // Check if we should fetch orders (with orderNumber) or cart items (without orderNumber)
    const fetchOrders = req.query.type === 'orders' || req.query.orders === 'true';

    let query;
    if (fetchOrders) {
      // Fetch actual orders (those with orderNumber)
      query = { 
        user: userId,
        orderNumber: { $exists: true, $ne: null }
      };
    } else {
      // Find ACTIVE CART ITEMS (not orders)
      // Active cart items: status "Pending" AND no orderNumber (not yet converted to order)
      query = { 
        user: userId,
        status: "Pending",
        $or: [
          { orderNumber: { $exists: false } },
          { orderNumber: null }
        ]
      };
    }
    
    console.log("🔍 getUserCart - userId:", userId);
    console.log("🔍 getUserCart - fetchOrders:", fetchOrders);
    console.log("🔍 getUserCart - query type:", fetchOrders ? "orders" : "cart items");
    
    // Get total count for pagination
    let totalCount;
    try {
      totalCount = await Cart.countDocuments(query);
      console.log("🔍 totalCount:", totalCount);
    } catch (countError) {
      console.error("❌ Error counting documents:", countError);
      throw countError;
    }
    
    // Fetch active cart items with pagination
    // Handle missing references gracefully (Mongoose will set them to null if product is deleted)
    let cartItems;
    try {
      console.log("🔍 Starting Cart.find() query...");
      // Try a simpler approach - fetch without nested populate first
      cartItems = await Cart.find(query)
        .populate("user", "username email phone")
        .populate("product", "title description brand category price image")
        .populate("featuredProduct", "title description brand category price image")
        .populate("onlineProduct", "title description brand category price image")
        .populate("offerProduct", "title description brand category price image startDate endDate")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(); // Use lean() to get plain objects
      
      console.log("✅ Fetched cartItems count:", cartItems ? cartItems.length : 0);
      
      // Safety check
      if (!Array.isArray(cartItems)) {
        console.warn("⚠️ cartItems is not an array, converting...");
        cartItems = cartItems ? [cartItems] : [];
      }
      
      // Note: items.product will remain as IDs for now
      // We'll populate them in the formatting step if needed
      // This avoids potential errors with nested populate
    } catch (populateError) {
      console.error("❌ Error during populate:", populateError);
      console.error("❌ Populate error message:", populateError.message);
      console.error("❌ Populate error name:", populateError.name);
      console.error("❌ Populate error stack:", populateError.stack);
      throw populateError;
    }

    // Format cart items for response - return as array of cart items, not orders
    const formattedItems = [];
    
    // Safety check
    if (!cartItems || !Array.isArray(cartItems)) {
      console.warn("⚠️ cartItems is not an array:", cartItems);
      cartItems = [];
    }
    
    console.log("🔍 Processing cartItems, count:", cartItems.length);
    
    cartItems.forEach((cartItem, index) => {
      try {
        if (!cartItem) {
          console.warn(`⚠️ cartItem at index ${index} is null or undefined`);
          return;
        }
        
        console.log(`🔍 Processing cartItem ${index + 1}/${cartItems.length}, _id: ${cartItem._id}`);
        
        // Handle both new format (items array) and old format (single product)
        let items = [];
        let subtotal = 0;
        let totalBeforeDiscount = 0;
        let totalItemDiscount = 0;

        if (cartItem.items && Array.isArray(cartItem.items) && cartItem.items.length > 0) {
          // New format: items array
          items = cartItem.items.map(orderItem => {
            // Handle product - it might be an ID, an object, or null
            let product = null;
            if (orderItem.product) {
              // If it's already an object (populated), use it
              if (typeof orderItem.product === 'object' && orderItem.product._id) {
                product = orderItem.product;
              } else {
                // It's just an ID - we'll keep it as is for now
                // The frontend can handle fetching product details if needed
                product = orderItem.product;
              }
            }
            
            return {
              product: product,
              quantity: orderItem.quantity || 1,
              unitPrice: orderItem.unitPrice || 0,
              discountApplied: orderItem.discountApplied || 0,
              couponDiscount: orderItem.couponDiscount || 0,
              finalPrice: orderItem.finalPrice || 0
            };
          });

          // Calculate totals from items (finalPrice already includes coupon discount)
          items.forEach(orderItem => {
            // Count items even if product is just an ID (not populated)
            // We have finalPrice which is what matters for totals
            const itemTotal = (orderItem.finalPrice || 0) * (orderItem.quantity || 1);
            subtotal += itemTotal;
            totalBeforeDiscount += (orderItem.unitPrice || 0) * (orderItem.quantity || 1);
            totalItemDiscount += (orderItem.discountApplied || 0) * (orderItem.quantity || 1);
          });
        } else {
          // Old format: single product (backward compatibility)
          // Check for product, featuredProduct, onlineProduct, or offerProduct
          const product = cartItem.product || cartItem.featuredProduct || cartItem.onlineProduct || cartItem.offerProduct;
          
          if (product) {
            const quantity = cartItem.quantity || 1;
            // Handle both populated product object and product ID
            let unitPrice = 0;
            if (typeof product === 'object' && product !== null && product.price !== undefined) {
              unitPrice = product.price || 0;
            } else {
              // Product is just an ID, we can't get the price
              // Use the unitPrice from cartItem if available, or default to 0
              unitPrice = cartItem.unitPrice || 0;
            }
            
            // Calculate discount if applicable
            let discountApplied = 0;
            let finalPrice = unitPrice;
            
            if (cartItem.discount > 0) {
              discountApplied = (unitPrice * cartItem.discount) / 100;
              finalPrice = unitPrice - discountApplied;
            }

            items = [{
              product: product,
              quantity: quantity,
              unitPrice: unitPrice,
              discountApplied: discountApplied,
              finalPrice: finalPrice
            }];

            subtotal = finalPrice * quantity;
            totalBeforeDiscount = unitPrice * quantity;
            totalItemDiscount = discountApplied * quantity;
          }
        }

        // Only add items that have valid products (product can be an ID or an object)
        const validItems = items.filter(item => item.product !== null && item.product !== undefined);
        if (validItems.length > 0) {
          // Only process orders with valid items
          // Calculate total coupon discount from items (for backward compatibility)
          let totalCouponDiscountFromItems = 0;
          validItems.forEach(orderItem => {
            totalCouponDiscountFromItems += (orderItem.couponDiscount || 0) * (orderItem.quantity || 1);
          });
          
          // Use item-level coupon discount sum, fallback to order-level for backward compatibility
          const couponDiscount = totalCouponDiscountFromItems || cartItem.couponDiscount || 0;
          const deliveryFee = cartItem.deliveryFee || 0;
          const totalPrice = Math.max(0, subtotal + deliveryFee); // finalPrice already includes coupon discount

          const totalQuantity = validItems.length > 0 
            ? validItems.reduce((sum, i) => sum + (i.quantity || 1), 0)
            : 0;

          // Safely format the order object
          const formattedOrder = {
            _id: cartItem._id || null,
            orderNumber: cartItem.orderNumber || null,
            user: cartItem.user || null,
            items: validItems || [], // Filter out items without products
            quantity: totalQuantity || 0,
            status: cartItem.status || "Pending",
            couponCode: cartItem.couponCode || null,
            couponDiscount: couponDiscount || 0,
            deliveryFee: deliveryFee || 0,
            paymentMethod: cartItem.paymentMethod || "Cash",
            totalBeforeDiscount: totalBeforeDiscount || 0,
            totalItemDiscount: totalItemDiscount || 0,
            totalDiscount: (totalItemDiscount || 0) + (couponDiscount || 0),
            subtotal: subtotal || 0,
            totalPrice: totalPrice || 0,
            createdAt: cartItem.createdAt ? (cartItem.createdAt instanceof Date ? cartItem.createdAt.toISOString() : cartItem.createdAt) : new Date().toISOString(),
            updatedAt: cartItem.updatedAt ? (cartItem.updatedAt instanceof Date ? cartItem.updatedAt.toISOString() : cartItem.updatedAt) : new Date().toISOString(),
          };
          
          // Only add backward compatibility fields if they exist
          if (cartItem.product || cartItem.featuredProduct || cartItem.onlineProduct || cartItem.offerProduct) {
            formattedOrder.product = cartItem.product || null;
            formattedOrder.featuredProduct = cartItem.featuredProduct || null;
            formattedOrder.onlineProduct = cartItem.onlineProduct || null;
            formattedOrder.offerProduct = cartItem.offerProduct || null;
            // Prioritize totalQuantity (from items array) over old cartItem.quantity
            // Only use cartItem.quantity if totalQuantity is 0 (true old format without items array)
            formattedOrder.quantity = totalQuantity > 0 ? totalQuantity : (cartItem.quantity || 0);
          }
          
          formattedItems.push(formattedOrder);
        }
      } catch (itemError) {
        const itemId = cartItem?._id || `index-${index}`;
        console.error(`❌ Error processing cart item ${itemId}:`, itemError);
        console.error(`❌ Error stack:`, itemError.stack);
        // Continue processing other items even if one fails
      }
    });

    // If pagination is requested, return paginated format, otherwise return simple array
    try {
      console.log("🔍 About to send response - formattedItems count:", formattedItems.length);
      console.log("🔍 totalCount:", totalCount);
      
      const responseData = req.query.page || req.query.limit
        ? {
            orders: formattedItems || [],
            totalCount: totalCount || 0,
            currentPage: page,
            totalPages: Math.ceil((totalCount || 0) / limit),
            limit: limit
          }
        : formattedItems || [];
      
      console.log("🔍 Sending response with", Array.isArray(responseData) ? responseData.length : responseData.orders?.length, "items");
      res.status(200).json(responseData);
    } catch (jsonError) {
      console.error("❌ Error sending response:", jsonError);
      console.error("❌ JSON error message:", jsonError.message);
      console.error("❌ JSON error stack:", jsonError.stack);
      if (!res.headersSent) {
        res.status(500).json({ 
          message: "Error formatting response", 
          error: jsonError.message
        });
      }
    }
  } catch (error) {
    console.error("❌ Error fetching user cart:", error);
    console.error("❌ Error stack:", error.stack);
    console.error("❌ Error details:", {
      message: error.message,
      name: error.name,
      code: error.code
    });
    
    // Make sure we send a response even if there's an error
    if (!res.headersSent) {
      res.status(500).json({ 
        message: "Error fetching user cart", 
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
};

// جلب كل الكارتات (للأدمن)
exports.getAllCarts = async (req, res) => {
  try {
    let carts = await Cart.find()
      .populate("product", "title description brand category price image")
      .populate("items.product", "title description brand category price image")
      .populate("user", "username email phone address")
      .populate("guest", "username email phone address")
      .populate("deliveryAddress")
      .sort({ createdAt: -1 });

    // Format carts for response
    carts = carts.map((item) => {
      // Handle both old format (single product) and new format (items array)
      let items = [];
      let totalPrice = 0;
      let totalBeforeDiscount = 0;
      let totalItemDiscount = 0;

      if (item.items && item.items.length > 0) {
        // New format: items array
        items = item.items.map(orderItem => ({
          product: orderItem.product,
          quantity: orderItem.quantity,
          unitPrice: orderItem.unitPrice,
          discountApplied: orderItem.discountApplied,
          couponDiscount: orderItem.couponDiscount || 0,
          finalPrice: orderItem.finalPrice
        }));

        // Calculate totals from items (finalPrice already includes coupon discount)
        items.forEach(orderItem => {
          const itemTotal = orderItem.finalPrice * orderItem.quantity;
          totalPrice += itemTotal;
          totalBeforeDiscount += orderItem.unitPrice * orderItem.quantity;
          totalItemDiscount += orderItem.discountApplied * orderItem.quantity;
        });
      } else if (item.product) {
        // Old format: single product
        const quantity = item.quantity || 1;
        const unitPrice = item.product?.price || 0;
        const discountApplied = 0; // Old format doesn't have item-level discounts
        const finalPrice = unitPrice;

        items = [{
          product: item.product,
          quantity: quantity,
          unitPrice: unitPrice,
          discountApplied: discountApplied,
          finalPrice: finalPrice
        }];

        totalPrice = finalPrice * quantity;
        totalBeforeDiscount = unitPrice * quantity;
      }

      // Calculate total coupon discount from items (for backward compatibility)
      let totalCouponDiscountFromItems = 0;
      items.forEach(orderItem => {
        totalCouponDiscountFromItems += (orderItem.couponDiscount || 0) * orderItem.quantity;
      });
      
      // Use item-level coupon discount sum, fallback to order-level for backward compatibility
      const couponDiscount = totalCouponDiscountFromItems || item.couponDiscount || 0;
      const deliveryFee = item.deliveryFee || 0;
      const finalTotal = Math.max(0, totalPrice + deliveryFee); // finalPrice already includes coupon discount

      return {
        _id: item._id,
        orderNumber: item.orderNumber || null,
        user: item.user,
        guest: item.guest,
        items: items,
        quantity: item.quantity || (items.length > 0 ? items.reduce((sum, i) => sum + i.quantity, 0) : 0),
        status: item.status,
        couponCode: item.couponCode || null,
        couponDiscount: couponDiscount,
        deliveryFee: deliveryFee,
        paymentMethod: item.paymentMethod || "Cash",
        deliveryAddress: item.deliveryAddress,
        deliveryAddressInfo: item.deliveryAddressInfo,
        totalBeforeDiscount: totalBeforeDiscount,
        totalItemDiscount: totalItemDiscount,
        totalDiscount: totalItemDiscount + couponDiscount,
        totalPrice: finalTotal,
        trackingToken: item.trackingToken || null,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        // Backward compatibility fields
        product: item.product || null,
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

    // Get the current order to check if status is changing
    const currentOrder = await Cart.findById(id).populate("user", "username email");
    
    if (!currentOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    const oldStatus = currentOrder.status;
    const newStatus = status || currentOrder.status;

    const updatedItem = await Cart.findByIdAndUpdate(
      id,
      { quantity, ...(status && { status }) },
      { new: true }
    );

    // Create notification if status changed
    if (status && oldStatus !== newStatus) {
      try {
        const { createNotification, notifyAllAdmins } = require("./Notification");
        
        // Determine notification type based on status
        let notificationType = "order_status_changed";
        let title = "Order Status Updated";
        let message = `Your order #${currentOrder.orderNumber || id} status has been updated to ${newStatus}.`;
        
        // Map status to specific notification types
        const statusMap = {
          "Processing": { type: "order_processing", title: "Order Processing", message: `Your order #${currentOrder.orderNumber || id} is now being processed.` },
          "Shipped": { type: "order_shipped", title: "Order Shipped", message: `Your order #${currentOrder.orderNumber || id} has been shipped and is on its way!` },
          "Delivered": { type: "order_delivered", title: "Order Delivered", message: `Your order #${currentOrder.orderNumber || id} has been delivered successfully!` },
          "Cancelled": { type: "order_cancelled", title: "Order Cancelled", message: `Your order #${currentOrder.orderNumber || id} has been cancelled.` },
          "Pending": { type: "order_pending", title: "Order Pending", message: `Your order #${currentOrder.orderNumber || id} is pending confirmation.` },
        };
        
        if (statusMap[newStatus]) {
          notificationType = statusMap[newStatus].type;
          title = statusMap[newStatus].title;
          message = statusMap[newStatus].message;
        }

        // Notify user if order belongs to a user
        if (currentOrder.user) {
          await createNotification({
            recipientId: currentOrder.user._id,
            type: notificationType,
            title: title,
            message: message,
            relatedOrderId: id,
            metadata: { orderNumber: currentOrder.orderNumber, oldStatus, newStatus }
          });
        }

        // For cancellations, notify all admins
        if (newStatus === "Cancelled") {
          await notifyAllAdmins({
            type: "order_cancelled",
            title: "Order Cancelled",
            message: `Order #${currentOrder.orderNumber || id} has been cancelled${currentOrder.user ? ` by user ${currentOrder.user.username || currentOrder.user.email}` : ' by guest'}.`,
            relatedOrderId: id,
            relatedUserId: currentOrder.user?._id || null,
            metadata: { orderNumber: currentOrder.orderNumber, cancelledBy: req.user?.role || "user" }
          });
        }
      } catch (notificationError) {
        // Don't fail the update if notification fails
        console.error("⚠️ Error creating notifications for status update:", notificationError);
      }
    }

    res.status(200).json(updatedItem);
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({ message: "Error updating cart item", error: error.message });
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

// Get cart by ID (admin only)
exports.getCartById = async (req, res) => {
  try {
    const { id } = req.params;
    const cart = await Cart.findById(id)
      .populate("user", "username email phone")
      .populate("guest", "username email phone address")
      .populate("product", "title description brand category price image")
      .populate("items.product", "title description brand category price image")
      .populate("deliveryAddress"); // Populate delivery address reference

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.status(200).json(cart);
  } catch (error) {
    console.error("GetCartById Error:", error);
    res.status(500).json({ message: "Error fetching cart", error: error.message });
  }
};

// Get user orders (admin only - get orders for a specific user)
exports.getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Only fetch actual orders (those with orderNumber)
    const query = { 
      user: userId,
      orderNumber: { $exists: true, $ne: null }
    };

    // Get total count for pagination
    const totalCount = await Cart.countDocuments(query);

    // Fetch orders with pagination
    let orders = await Cart.find(query)
      .populate("user", "username email phone")
      .populate("items.product", "title description brand category price image")
      .populate("deliveryAddress")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Format orders similar to getAllCarts
    orders = orders.map((item) => {
      // Handle both old format (single product) and new format (items array)
      let items = [];
      let totalPrice = 0;
      let totalBeforeDiscount = 0;
      let totalItemDiscount = 0;

      if (item.items && item.items.length > 0) {
        // New format: items array
        items = item.items.map(orderItem => ({
          product: orderItem.product,
          quantity: orderItem.quantity,
          unitPrice: orderItem.unitPrice,
          discountApplied: orderItem.discountApplied,
          couponDiscount: orderItem.couponDiscount || 0,
          finalPrice: orderItem.finalPrice
        }));

        // Calculate totals from items (finalPrice already includes coupon discount)
        items.forEach(orderItem => {
          const itemTotal = orderItem.finalPrice * orderItem.quantity;
          totalPrice += itemTotal;
          totalBeforeDiscount += orderItem.unitPrice * orderItem.quantity;
          totalItemDiscount += orderItem.discountApplied * orderItem.quantity;
        });
      } else if (item.product) {
        // Old format: single product
        const quantity = item.quantity || 1;
        const unitPrice = item.product?.price || 0;
        const discountApplied = 0;
        const finalPrice = unitPrice;

        items = [{
          product: item.product,
          quantity: quantity,
          unitPrice: unitPrice,
          discountApplied: discountApplied,
          finalPrice: finalPrice
        }];

        totalPrice = finalPrice * quantity;
        totalBeforeDiscount = unitPrice * quantity;
      }

      // Calculate total coupon discount from items
      let totalCouponDiscountFromItems = 0;
      items.forEach(orderItem => {
        totalCouponDiscountFromItems += (orderItem.couponDiscount || 0) * orderItem.quantity;
      });
      
      const couponDiscount = totalCouponDiscountFromItems || item.couponDiscount || 0;
      const deliveryFee = item.deliveryFee || 0;
      const finalTotal = Math.max(0, totalPrice + deliveryFee);

      return {
        _id: item._id,
        orderNumber: item.orderNumber || null,
        user: item.user,
        guest: item.guest,
        items: items,
        quantity: item.quantity || (items.length > 0 ? items.reduce((sum, i) => sum + i.quantity, 0) : 0),
        status: item.status,
        couponCode: item.couponCode || null,
        couponDiscount: couponDiscount,
        deliveryFee: deliveryFee,
        paymentMethod: item.paymentMethod || "Cash",
        deliveryAddress: item.deliveryAddress,
        deliveryAddressInfo: item.deliveryAddressInfo,
        totalBeforeDiscount: totalBeforeDiscount,
        totalItemDiscount: totalItemDiscount,
        totalDiscount: totalItemDiscount + couponDiscount,
        totalPrice: finalTotal,
        trackingToken: item.trackingToken || null,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        product: item.product || null,
      };
    });

    res.status(200).json({
      orders,
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
    });
  } catch (error) {
    console.error("GetUserOrders Error:", error);
    res.status(500).json({ message: "Error fetching user orders", error: error.message });
  }
};

// Get single order for logged-in user
exports.getUserOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const order = await Cart.findOne({ _id: id, user: userId })
      .populate("user", "username email phone")
      .populate("items.product", "title description brand category price image")
      .populate("deliveryAddress");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("GetUserOrderById Error:", error);
    res.status(500).json({ message: "Error fetching order", error: error.message });
  }
};

// Track order by token (for anonymous users)
exports.trackOrderByToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        message: "Tracking token is required",
        status: 400,
        error: "Token parameter is missing"
      });
    }

    const order = await Cart.findOne({ trackingToken: token })
      .populate("guest", "username email phone address")
      .populate("items.product", "title description brand category price image");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
        status: 404,
        error: "Invalid tracking token"
      });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("TrackOrderByToken Error:", error);
    res.status(500).json({
      message: "Error tracking order",
      status: 500,
      error: error.message
    });
  }
};

// Cancel order by tracking token (for anonymous users)
exports.cancelOrderByToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        message: "Tracking token is required",
        status: 400,
        error: "Token parameter is missing"
      });
    }

    // Find order by tracking token
    const currentOrder = await Cart.findOne({ trackingToken: token });
    
    if (!currentOrder) {
      return res.status(404).json({
        message: "Order not found",
        status: 404,
        error: "Invalid tracking token"
      });
    }

    // Check if order can be cancelled (only Pending or Accepted & Processed)
    const cancellableStatuses = ["Pending", "Accepted & Processed"];
    if (!cancellableStatuses.includes(currentOrder.status)) {
      return res.status(400).json({
        message: "Cannot cancel this order. Only orders with 'Pending' or 'Accepted & Processed' status can be cancelled.",
        status: 400,
        error: "Order cannot be cancelled in current status"
      });
    }

    const oldStatus = currentOrder.status;
    
    // Update order status to Cancelled
    const updatedOrder = await Cart.findByIdAndUpdate(
      currentOrder._id,
      { status: "Cancelled" },
      { new: true }
    );

    // Create notification for cancellation
    try {
      const { createNotification, notifyAllAdmins } = require("./Notification");
      
      // Notify user if order belongs to a user
      if (currentOrder.user) {
        await createNotification({
          recipientId: currentOrder.user._id,
          type: "order_cancelled",
          title: "Order Cancelled",
          message: `Your order #${currentOrder.orderNumber || currentOrder._id} has been cancelled.`,
          relatedOrderId: currentOrder._id,
          metadata: { orderNumber: currentOrder.orderNumber, oldStatus, newStatus: "Cancelled" }
        });
      }

      // Notify all admins about the cancellation
      await notifyAllAdmins({
        type: "order_cancelled",
        title: "Order Cancelled",
        message: `Order #${currentOrder.orderNumber || currentOrder._id} has been cancelled by guest user.`,
        relatedOrderId: currentOrder._id,
        relatedUserId: currentOrder.user?._id || null,
        metadata: { orderNumber: currentOrder.orderNumber, cancelledBy: "guest" }
      });
    } catch (notificationError) {
      // Don't fail the update if notification fails
      console.error("⚠️ Error creating notifications for order cancellation:", notificationError);
    }

    res.status(200).json({
      message: "Order cancelled successfully",
      order: updatedOrder
    });
  } catch (error) {
    console.error("CancelOrderByToken Error:", error);
    res.status(500).json({
      message: "Error cancelling order",
      status: 500,
      error: error.message
    });
  }
};

// Create order (supports both authenticated and guest users)
exports.createOrder = async (req, res) => {
  try {
    // SECURITY: Always get userId from JWT token if user is authenticated
    let userId = null;
    
    if (req.user?._id) {
      userId = req.user._id.toString();
      
      if (req.body.userId) {
        return res.status(403).json({
          message: "Security violation: userId must not be sent in request body. Backend uses JWT token to identify authenticated users.",
          status: 403,
          error: "Do not send userId in request body when authenticated"
        });
      }
    }
    
    const {
      guestId,
      items,
      couponCode,
      discount,
      paymentMethod,
      deliveryAddressId,
      deliveryAddressInfo,
      username,
      email,
      phone,
      address,
    } = req.body;

    const Product = require("../models/Product");
    const Offer = require("../models/Offer");

    // Validate items array
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Items array is required and must contain at least one item",
        status: 400,
        error: "Items array is empty or missing"
      });
    }

    // Handle guest user creation if needed
    let finalGuestId = guestId;
    if (!userId && !guestId && (username || phone || address)) {
      let guest = await WithoutRegister.findOne({ phone });
      if (!guest) {
        guest = await WithoutRegister.create({ username, email, phone, address });
      } else {
        guest.username = username || guest.username;
        guest.address = address || guest.address;
        if (email) guest.email = email;
        await guest.save();
      }
      finalGuestId = guest._id;
    }

    if (!userId && !finalGuestId) {
      return res.status(400).json({
        message: "userId or guestId (or guest info) is required",
        status: 400,
        error: "User or guest identification is required"
      });
    }

    // Fetch all active discount offers
    const now = new Date();
    const activeDiscountOffers = await Offer.find({
      type: "discount",
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).lean();

    const productOfferMap = new Map();
    activeDiscountOffers.forEach(offer => {
      offer.products.forEach(productId => {
        const productIdStr = productId.toString();
        if (!productOfferMap.has(productIdStr)) {
          productOfferMap.set(productIdStr, offer);
        }
      });
    });

    // Validate items and calculate pricing
    const validatedItems = [];
    for (const item of items) {
      const quantity = item.quantity || 1;
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return res.status(400).json({
          message: `Product with ID ${item.productId} not found`,
          status: 400,
          error: "Invalid product ID"
        });
      }

      const unitPrice = product.price;
      let discountApplied = 0;
      let finalPrice = unitPrice;
      
      // Check for active discount offers
      const productIdStr = item.productId.toString();
      const offer = productOfferMap.get(productIdStr);
      
      if (offer) {
        let offerDiscountAmount = 0;
        
        if (offer.discountType === "percentage" || offer.discountType === "percent") {
          offerDiscountAmount = (unitPrice * offer.discountValue) / 100;
        } else {
          offerDiscountAmount = Math.min(offer.discountValue, unitPrice);
        }
        
        discountApplied = offerDiscountAmount;
        finalPrice = unitPrice - discountApplied;
      }

      validatedItems.push({
        orderItem: {
          quantity,
          unitPrice,
          discountApplied,
          finalPrice,
          product: item.productId, // ObjectId reference for database
          productId: item.productId.toString()
        },
        finalPrice,
        productType: "product",
        product: product // Store full product object for coupon validation
      });
    }

    // Validate coupon code if provided
    let finalCouponCode = couponCode || null;
    let validCoupon = null;
    
    if (couponCode) {
      try {
        const couponCodeUpper = couponCode.trim().toUpperCase();
        
        const coupon = await Offer.findOne({
          type: "coupon",
          discountCode: { $regex: new RegExp(`^${couponCodeUpper.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i") },
          isActive: true,
          startDate: { $lte: now },
          endDate: { $gte: now }
        }).populate("products", "_id");
        
        if (!coupon) {
          return res.status(400).json({
            message: "Invalid coupon code",
            status: 400,
            error: "Coupon code not found or inactive"
          });
        }
        
        if (!coupon.products || coupon.products.length === 0) {
          return res.status(400).json({
            message: "Invalid coupon code",
            status: 400,
            error: "Coupon has no associated products"
          });
        }
        
        // Convert coupon products to strings for comparison
        // Handle both ObjectId and populated product objects
        const couponProductIds = coupon.products.map(p => {
          if (p._id) return p._id.toString();
          return p.toString();
        });
        
        // Check if at least one item in the order matches a product in the coupon
        // For coupons, only check if product is in the coupon's product list (selected in edit page)
        let hasMatchingProduct = false;
        for (const item of items) {
          const productId = item.productId;
          
          if (productId) {
            const productIdStr = productId.toString();
            // If product is in coupon's product list, it supports the coupon
            if (couponProductIds.includes(productIdStr)) {
              hasMatchingProduct = true;
              break;
            }
          }
        }
        
        if (!hasMatchingProduct) {
          return res.status(400).json({
            message: "Invalid coupon code",
            status: 400,
            error: "Coupon code is not valid for any products in this order"
          });
        }
        
        validCoupon = coupon;
        finalCouponCode = coupon.discountCode;
        
        // SECURITY NOTE: Discount value from frontend is ignored for security
        // Backend will recalculate discount per item based on validated coupon
      } catch (couponError) {
        console.error("❌ Coupon validation error:", couponError);
        return res.status(400).json({
          message: "Error validating coupon",
          status: 400,
          error: couponError.message
        });
      }
    }

    // Apply coupon discount to only ONE eligible item if coupon is valid
    let totalCouponDiscount = 0;
    if (validCoupon && validCoupon.products && validCoupon.products.length > 0) {
      // Convert coupon products to strings for comparison
      // Handle both ObjectId and populated product objects
      const couponProductIds = validCoupon.products.map(p => {
        if (p._id) return p._id.toString();
        return p.toString();
      });
      
      // First, set couponDiscount to 0 for all items
      validatedItems.forEach((validatedItem) => {
        validatedItem.orderItem.couponDiscount = 0;
      });
      
      // Find all eligible items (items whose products are in the coupon's products list)
      const eligibleItems = validatedItems
        .map((validatedItem, index) => {
          const productIdStr = validatedItem.product._id.toString();
          const product = validatedItem.product;
          
          if (couponProductIds.includes(productIdStr) && product) {
            return {
              index,
              validatedItem,
              productIdStr,
              product,
              itemFinalPrice: validatedItem.orderItem.finalPrice,
              quantity: validatedItem.orderItem.quantity || 1,
            };
          }
          return null;
        })
        .filter(item => item !== null);
      
      // If there are eligible items, select only ONE based on couponApplyTo configuration
      if (eligibleItems.length > 0) {
        let selectedItem = null;
        const applyTo = validCoupon.couponApplyTo || "first"; // Default to "first"
        
        if (applyTo === "first") {
          // Apply to the first eligible item
          selectedItem = eligibleItems[0];
        } else if (applyTo === "lowest") {
          // Apply to the eligible item with the lowest price
          selectedItem = eligibleItems.reduce((lowest, current) => {
            const lowestPrice = lowest.itemFinalPrice;
            const currentPrice = current.itemFinalPrice;
            return currentPrice < lowestPrice ? current : lowest;
          });
        } else if (applyTo === "highest") {
          // Apply to the eligible item with the highest price
          selectedItem = eligibleItems.reduce((highest, current) => {
            const highestPrice = highest.itemFinalPrice;
            const currentPrice = current.itemFinalPrice;
            return currentPrice > highestPrice ? current : highest;
          });
        }
        
        // Apply coupon discount only to the selected item
        if (selectedItem) {
          const { validatedItem, itemFinalPrice, quantity } = selectedItem;
          const itemSubtotal = itemFinalPrice * quantity;
          
          let itemCouponDiscount = 0;
          
          // Calculate coupon discount for this specific item
          if (validCoupon.discountType === "percentage" || validCoupon.discountType === "percent") {
            itemCouponDiscount = (itemSubtotal * validCoupon.discountValue) / 100;
          } else {
            // Fixed amount discount - apply proportionally or up to item subtotal
            itemCouponDiscount = Math.min(validCoupon.discountValue, itemSubtotal);
          }
          
          // Apply coupon discount to item's finalPrice (per unit)
          const couponDiscountPerUnit = itemCouponDiscount / quantity;
          validatedItem.orderItem.couponDiscount = couponDiscountPerUnit;
          validatedItem.orderItem.finalPrice = Math.max(0, itemFinalPrice - couponDiscountPerUnit);
          
          totalCouponDiscount = itemCouponDiscount;
        }
      }
    } else {
      // No coupon code or invalid coupon - set couponDiscount to 0 for all items
      validatedItems.forEach((validatedItem) => {
        validatedItem.orderItem.couponDiscount = 0;
      });
    }

    const orderItems = validatedItems.map(item => item.orderItem);

    // Handle delivery address
    let finalDeliveryAddressId = null;
    let finalDeliveryAddressInfo = null;

    if (userId && deliveryAddressId) {
      const DeliveryAddress = require("../models/DeliveryAddress");
      const address = await DeliveryAddress.findById(deliveryAddressId);
      if (address && address.user.toString() === userId.toString()) {
        finalDeliveryAddressId = deliveryAddressId;
      } else {
        return res.status(400).json({
          message: "Invalid delivery address",
          status: 400,
          error: "Delivery address not found or doesn't belong to user"
        });
      }
    } else if (deliveryAddressInfo) {
      if (userId) {
        if (!deliveryAddressInfo.name || !deliveryAddressInfo.phone || 
            !deliveryAddressInfo.city || !deliveryAddressInfo.governorate || 
            !deliveryAddressInfo.street) {
          return res.status(400).json({
            message: "Invalid delivery address information",
            status: 400,
            error: "Missing required fields: name, phone, city, governorate, and street are required"
          });
        }
        
        const DeliveryAddress = require("../models/DeliveryAddress");
        const newAddress = await DeliveryAddress.create({
          user: userId,
          name: deliveryAddressInfo.name,
          phone: deliveryAddressInfo.phone,
          city: deliveryAddressInfo.city,
          governorate: deliveryAddressInfo.governorate,
          street: deliveryAddressInfo.street,
          number: deliveryAddressInfo.number || "",
          buildingNumber: deliveryAddressInfo.buildingNumber || "",
          isDefault: deliveryAddressInfo.isDefault || false,
        });
        finalDeliveryAddressId = newAddress._id;
      } else {
        if (!deliveryAddressInfo.name || !deliveryAddressInfo.phone || !deliveryAddressInfo.street) {
          return res.status(400).json({
            message: "Invalid delivery address information",
            status: 400,
            error: "Missing required fields: name, phone, and street are required"
          });
        }
        
        finalDeliveryAddressInfo = {
          name: deliveryAddressInfo.name,
          phone: deliveryAddressInfo.phone,
          city: deliveryAddressInfo.city || "Not specified",
          governorate: deliveryAddressInfo.governorate || "Not specified",
          street: deliveryAddressInfo.street,
          number: deliveryAddressInfo.number || "",
          buildingNumber: deliveryAddressInfo.buildingNumber || "",
        };
      }
    } else if (userId) {
      // Automatically use user's default delivery address if available
      const DeliveryAddress = require("../models/DeliveryAddress");
      const defaultAddress = await DeliveryAddress.findOne({ user: userId, isDefault: true });
      if (defaultAddress) {
        finalDeliveryAddressId = defaultAddress._id;
      } else {
        // If no saved address, automatically create deliveryAddressInfo from user's account
        // Get user information from database to ensure we have complete data
        const User = require("../models/User");
        const userData = await User.findById(userId).select("username email phone address");
        
        if (userData) {
          // Automatically use user's account information - no need for user to enter again
          finalDeliveryAddressInfo = {
            name: userData.username || "",
            phone: userData.phone || "",
            city: userData.address ? (userData.address.split(',')[0] || "") : "",
            governorate: userData.address ? (userData.address.split(',')[1] || "") : "",
            street: userData.address || "",
            number: "",
            buildingNumber: ""
          };
        }
      }
    }

    // Generate order number and tracking token
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    let trackingToken = null;
    if (!userId && finalGuestId) {
      trackingToken = `TRK-${Date.now()}-${Math.random().toString(36).substr(2, 16).toUpperCase()}`;
    }
    
    // Calculate total quantity from items array
    const totalQuantity = orderItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
    
    const orderData = {
      orderNumber,
      user: userId || undefined,
      guest: finalGuestId || undefined,
      items: orderItems,
      quantity: totalQuantity, // Set total quantity from items array
      couponCode: finalCouponCode,
      couponDiscount: totalCouponDiscount, // Sum of all item-level coupon discounts
      deliveryFee: 0,
      paymentMethod: paymentMethod || "Cash",
      status: "Pending",
      ...(trackingToken && { trackingToken }),
    };

    if (finalDeliveryAddressId) {
      orderData.deliveryAddress = finalDeliveryAddressId;
    } else if (finalDeliveryAddressInfo) {
      orderData.deliveryAddressInfo = finalDeliveryAddressInfo;
    }
    
    const order = await Cart.create(orderData);

    // Populate order data
    await order.populate([
      { path: "user", select: "username publicId" },
      { path: "guest", select: "username publicId" },
      { path: "deliveryAddress" }
    ]);

    // Calculate totals from items (finalPrice already includes coupon discount)
    let subtotal = 0;
    let totalBeforeDiscount = 0;
    let totalItemDiscount = 0;
    let totalCouponDiscountFromItems = 0;
    
    validatedItems.forEach((validatedItem) => {
      const quantity = validatedItem.orderItem.quantity || 1;
      const unitPrice = validatedItem.orderItem.unitPrice || 0;
      const discountApplied = validatedItem.orderItem.discountApplied || 0;
      const couponDiscount = validatedItem.orderItem.couponDiscount || 0;
      const finalPrice = validatedItem.orderItem.finalPrice || 0; // Already includes coupon discount
      
      totalBeforeDiscount += unitPrice * quantity;
      totalItemDiscount += discountApplied * quantity;
      totalCouponDiscountFromItems += couponDiscount * quantity;
      subtotal += finalPrice * quantity; // finalPrice already has coupon discount applied
    });

    const totalDiscount = totalItemDiscount + totalCouponDiscountFromItems;
    const deliveryFee = order.deliveryFee || 0;
    const totalPrice = Math.max(0, subtotal + deliveryFee); // No need to subtract coupon discount again

    const formattedItems = order.items.map((item) => {
      const formattedItem = { 
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || 0,
        discountApplied: item.discountApplied || 0,
        couponDiscount: item.couponDiscount || 0,
        finalPrice: item.finalPrice || 0
      };
      if (item.product) formattedItem.productId = item.product.toString();
      return formattedItem;
    });

    // After successful order creation, remove items from wishlist (cart) for logged-in users
    if (userId) {
      try {
        const Wishlist = require("../models/Wishlist");
        
        // Get all product IDs from the order (use product ObjectId reference)
        const productIds = validatedItems
          .map(item => item.orderItem.product)
          .filter(id => id); // Filter out any null/undefined values
        
        if (productIds.length > 0) {
          // Delete wishlist items that match the ordered products
          const deleteResult = await Wishlist.deleteMany({
            user: userId,
            product: { $in: productIds }
          });
          console.log(`✅ Removed ${deleteResult.deletedCount} item(s) from wishlist after order creation`);
        }
      } catch (wishlistError) {
        // Don't fail the order if wishlist cleanup fails, but log it
        console.error("⚠️ Error removing items from wishlist after order:", wishlistError);
      }
    }

    // Create notifications for order creation
    try {
      const { createNotification, notifyAllAdmins } = require("./Notification");
      
      // Notify user if authenticated
      if (userId) {
        await createNotification({
          recipientId: userId,
          type: "order_created",
          title: "Order Placed Successfully",
          message: `Your order #${orderNumber} has been placed successfully and is being processed.`,
          relatedOrderId: order._id,
          metadata: { orderNumber, totalPrice }
        });
      }
      
      // Notify all admins about new order
      await notifyAllAdmins({
        type: "order_created",
        title: "New Order Received",
        message: `New order #${orderNumber} has been placed${userId ? ` by user` : ` by guest`}.`,
        relatedOrderId: order._id,
        relatedUserId: userId || null,
        metadata: { orderNumber, totalPrice, isGuest: !userId }
      });
    } catch (notificationError) {
      // Don't fail the order if notification fails
      console.error("⚠️ Error creating notifications for new order:", notificationError);
    }

    const responseData = {
      _id: order._id,
      user: order.user ? { _id: order.user._id, username: order.user.username } : null,
      guest: order.guest ? { _id: order.guest._id, username: order.guest.username } : null,
      items: formattedItems,
      quantity: totalQuantity, // Total quantity from items array
      couponCode: order.couponCode,
      couponDiscount: totalCouponDiscountFromItems, // Sum of item-level coupon discounts
      deliveryFee: deliveryFee,
      totalBeforeDiscount: totalBeforeDiscount,
      totalDiscount: totalDiscount,
      totalAfterDiscount: totalPrice,
      subtotal: subtotal,
      totalPrice: totalPrice,
      paymentMethod: order.paymentMethod,
      status: order.status,
      deliveryAddress: order.deliveryAddress,
      deliveryAddressInfo: order.deliveryAddressInfo || null,
      orderNumber: order.orderNumber,
      trackingToken: order.trackingToken || null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
    
    res.status(201).json(responseData);
  } catch (error) {
    console.error("❌ Create order error:", error);
    res.status(500).json({
      message: "Error creating order",
      status: 500,
      error: error.message
    });
  }
};
