const Cart = require("../models/Cart")
const WithoutRegister = require("../models/WithoutRegister")


exports.addToCart = async (req, res) => {
  try {
    const { userId, guestId, productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }

    if (!userId && !guestId) {
      return res.status(400).json({ message: "userId or guestId is required" });
    }

    // تحقق إذا العنصر موجود مسبقًا لنفس user أو guest
    let query = { product: productId };
    if (userId) query.user = userId;
    if (guestId) query.guest = guestId;

    let cartItem = await Cart.findOne(query);

    if (cartItem) {
      cartItem.quantity += quantity || 1;
      await cartItem.save();
    } else {
      cartItem = await Cart.create({
        user: userId || undefined,
        guest: guestId || undefined,
        product: productId,
        quantity: quantity || 1,
        status: "Pending",
      });
    }

    await cartItem.populate("product");
    await cartItem.populate("user", "username email phone");
    await cartItem.populate("guest", "username email phone address");

    res.status(201).json(cartItem);

  } catch (error) {
    console.error("addToCart error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "This product is already in the cart" });
    }
    res.status(500).json({ message: "Error adding to cart", error: error.message });
  }
};


exports.getUserCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.find({ user: userId })
      .populate("product")
      .populate("user", "name email phone");

    res.status(200).json(cart);
  } catch (error) {
    console.error("Cart fetch error:", error); 
    res.status(500).json({ message: "Error fetching cart", error: error.message });
  }
};



exports.getAllCarts = async (req, res) => {
  try {
    const carts = await Cart.find()
      .populate("product", "title price image description createdAt updatedAt")
      .populate("user", "username email phone address createdAt updatedAt")
      // خلي populate للزائر يكون اختياري
      .populate({
        path: "guest",
        select: "username email phone address createdAt updatedAt",
        options: { strictPopulate: false } // يتجاوز أي خطأ لو مش موجود
      });

    res.status(200).json(carts);
  } catch (error) {
    console.error("❌ Error in getAllCarts:", error);
    res.status(500).json({ message: "Error fetching carts", error: error.message });
  }
};


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


exports.deleteCartItem = async (req, res) => {
  try {
    const { id } = req.params; // cart item id
    const userId = req.user._id?.toString() || req.user.id?.toString();
    const userRole = req.user.role; // admin / user
   
    const cartItem = await Cart.findById(id);

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    const cartUserId = cartItem.user.toString();

    if (userRole !== "admin" && cartUserId !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this item" });
    }

    await Cart.findByIdAndDelete(id);

    res.status(200).json({ message: "Item removed from cart" });
  } catch (error) {
    console.error("DeleteCartItem Error:", error);
    res.status(500).json({ 
      message: "Error deleting cart item", 
      error: error
    });
  }
};