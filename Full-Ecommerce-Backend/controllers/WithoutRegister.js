const WithoutRegister = require("../models/WithoutRegister");
const Cart = require("../models/Cart");
const Product = require("../models/Product");


const createWithoutUserAndCart = async (req, res) => {
  try {
    const { 
      username, 
      email, 
      phone, 
      address, 
      productId, 
      quantity,
      couponCode,
      discount,
      paymentMethod
    } = req.body;

    console.log("📥 Guest order request:", {
      username,
      email,
      phone,
      address,
      productId,
      quantity,
      couponCode,
      discount,
      paymentMethod
    });

    // Check if at least one product ID is provided
    if (!productId) {
      console.error("❌ No product ID provided in guest order");
      return res.status(400).json({ 
        message: "productId is required",
        status: 400,
        error: "Product ID is required"
      });
    }

    // Validate required fields
    if (!username || !phone || !address) {
      console.error("❌ Missing required fields in guest order");
      return res.status(400).json({ 
        message: "username, phone, and address are required",
        status: 400,
        error: "Missing required fields"
      });
    }

    // 1️⃣ إنشاء الزائر
    let guest = await WithoutRegister.findOne({ phone });
    if (!guest) {
      guest = await WithoutRegister.create({ username, email, phone, address });
      console.log("✅ Created new guest user");
    } else {
      // Update guest info if exists
      guest.username = username;
      guest.address = address;
      if (email) guest.email = email;
      await guest.save();
      console.log("✅ Updated existing guest user");
    }

    // 2️⃣ إنشاء Cart مربوط بالزائر
    const cartData = {
      guest: guest._id,
      quantity: quantity || 1,
      status: "Pending",
      paymentMethod: paymentMethod || "Cash",
    };

    // Add product reference
    if (productId) cartData.product = productId;

    // Add optional fields
    if (couponCode) cartData.couponCode = couponCode;
    if (discount) cartData.discount = discount;

    // Check for existing cart item to avoid duplicates
    let cartItem = await Cart.findOne({
      guest: guest._id,
      ...(productId && { product: productId }),
    });

    if (cartItem) {
      // Update existing cart item
      cartItem.quantity += quantity || 1;
      if (couponCode) cartItem.couponCode = couponCode;
      if (discount) cartItem.discount = discount;
      if (paymentMethod) cartItem.paymentMethod = paymentMethod;
      await cartItem.save();
      console.log("✅ Updated existing cart item");
    } else {
      // Create new cart item
      cartItem = await Cart.create(cartData);
      console.log("✅ Created new cart item");
    }

    await cartItem.populate([
      { path: "product", select: "title category brand description price image stock shippingPrice supportsDiscount" },
      { path: "guest" }
    ]);

    res.status(201).json({
      message: "Order created successfully",
      cartItem,
      guest: {
        _id: guest._id,
        username: guest.username,
        email: guest.email,
        phone: guest.phone,
        address: guest.address,
        paymentMethod: paymentMethod || "Cash"
      }
    });
  } catch (error) {
    console.error("❌ Error creating guest cart:", error);
    console.error("❌ Error details:", {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack
    });
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      console.log("⚠️ Duplicate key error, attempting to handle gracefully");
      return res.status(400).json({ 
        message: "This order already exists",
        status: 400,
        error: "Duplicate entry"
      });
    }
    
    res.status(500).json({ 
      message: "Error creating guest cart",
      status: 500,
      error: error.message 
    });
  }
};


const getWithoutUsers = async (req, res) => {
  try {
    const users = await WithOut.find().sort({ createdAt: -1 });

    const usersWithProducts = await Promise.all(
      users.map(async (user) => {
        const carts = await Cart.find({ user: user._id }).populate("product", "title category brand description price image shippingPrice supportsDiscount");
        return {
          ...user._doc,
          products: carts.map(cart => ({
            _id: cart._id, // مهم
            product: cart.product,
            quantity: cart.quantity,
            status: cart.status,
          })),
        };
      })
    );

    res.status(200).json(usersWithProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error });
  }
};



const updateCartStatus = async (req, res) => {
  try {
    const { cartId } = req.params;     // id بتاع المنتج في الـ cart
    const { status } = req.body;       // القيمة الجديدة: "Complete" / "Failed" / "Pending"

    const cartItem = await Cart.findById(cartId);
    if (!cartItem) return res.status(404).json({ message: "Cart item not found" });

    cartItem.status = status;          // عدّل الحالة
    await cartItem.save();

    res.status(200).json({ message: "Status updated successfully", cart: cartItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error });
  }
};


const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    const user = await WithOut.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.status = status;
    await user.save();

    res.status(200).json({ message: "User status updated successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error });
  }
};

const deleteCartItem = async (req, res) => {
  try {
    const { cartId } = req.params;

    // نلاقي الـcart بالـID
    const cartItem = await WithOut.findById(cartId);
    if (!cartItem) return res.status(404).json({ message: "Cart not found" });

    // نحفظ userId قبل الحذف
    const userId = cartItem.user;

    // نحذف العنصر
    await cartItem.deleteOne();

    // نرجع رسالة نجاح
    res.status(200).json({ message: "Cart item deleted successfully", cartId, userId });
  } catch (error) {
    console.error("Error deleting cart item:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  createWithoutUserAndCart,
  getWithoutUsers,
  updateCartStatus,
  updateUserStatus,
  deleteCartItem,
};


