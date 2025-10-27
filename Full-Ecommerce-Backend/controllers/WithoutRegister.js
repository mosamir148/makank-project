const WithOut = require("../models/WithoutRegister");
const Cart = require("../models/Cart");
const Product = require("../models/Product");


const createWithoutUserAndCart = async (req, res) => {
  try {
    const { username, address, email, phone, phoneWhats, products, status } = req.body;

    console.log("💡 Body received:", req.body);

    // ابحث عن مستخدم موجود بنفس الهاتف
    let existingUser = await WithOut.findOne({ phone });

    if (!existingUser) {
      // لو مش موجود، أنشئ مستخدم جديد
      existingUser = new WithOut({
        username,
        address,
        email,
        phone,
        phoneWhats,
        status: status || "Pending",
      });
      await existingUser.save();
    } else {
      // لو موجود، حدث بياناته فقط بدون إعادة تعيين status
      existingUser.username = username;
      existingUser.address = address;
      existingUser.email = email;
      existingUser.phoneWhats = phoneWhats;
      await existingUser.save();
    }

    // معالجة الـ cart
    const cartItems = await Promise.all(
      products.map(async (item) => {
        // ابحث إذا المنتج موجود بالفعل في cart للمستخدم
        let existingCart = await Cart.findOne({ user: existingUser._id, product: item.productId });

        if (!existingCart) {
          // لو مش موجود، أنشئ cart جديد
          const newCart = new Cart({
            user: existingUser._id,
            product: item.productId,
            quantity: item.quantity || 1,
            status: "Pending", // جديد افتراضي
          });
          await newCart.save();
          return newCart;
        } else {
          // لو موجود، حدث الكمية فقط بدون إعادة تعيين status
          existingCart.quantity = item.quantity || existingCart.quantity;
          await existingCart.save();
          return existingCart;
        }
      })
    );

    console.log("✅ User and cart processed successfully");

    res.status(201).json({
      message: "User and cart processed successfully",
      user: existingUser,
      cart: cartItems,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error });
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


// PUT: تحديث status لمنتج معين في الـ cart
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


// PUT: تحديث status للمستخدم نفسه
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

module.exports = {
  createWithoutUserAndCart,
  getWithoutUsers,
  updateCartStatus,
  updateUserStatus,
};


