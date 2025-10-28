const WithoutRegister = require("../models/WithoutRegister");
const Cart = require("../models/Cart");
const Product = require("../models/Product");


const createWithoutUserAndCart = async (req, res) => {
  try {
    const { username, email, phone, address, productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }

    // 1️⃣ إنشاء الزائر
    const guest = await WithoutRegister.create({ username, email, phone, address });

    // 2️⃣ إنشاء Cart مربوط بالزائر
    const cartItem = await Cart.create({
      guest: guest._id,
      product: productId,
      quantity: quantity || 1,
      status: "Pending",
    });

    await cartItem.populate("product");
    await cartItem.populate("guest");

    res.status(201).json(cartItem);
  } catch (error) {
    console.error("❌ Error creating guest cart:", error);
    res.status(500).json({ message: "Error creating guest cart", error: error.message });
  }
};


const getWithoutUsers = async (req, res) => {
  try {
    const users = await WithOut.find().sort({ createdAt: -1 });

    const usersWithProducts = await Promise.all(
      users.map(async (user) => {
        const carts = await Cart.find({ user: user._id }).populate("product");
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


