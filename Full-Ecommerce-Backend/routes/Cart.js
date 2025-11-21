// Cart.js
const express = require("express");
const {
  addToCart,
  getUserCart,
  getAllCarts,
  getCartById,
  updateCartItem,
  deleteCartItem,
  createOrder,
  getUserOrders,
  getUserOrderById,
  trackOrderByToken,
  cancelOrderByToken,
} = require("../controllers/Cart");
const verifyAdmin = require("../middleware/verifyAdmin");
const verifyToken = require("../middleware/verifyToken");
const verifyTokenOptional = require("../middleware/verifyTokenOptional");

const router = express.Router();

// Verify createOrder function exists
if (!createOrder) {
  console.error("❌ createOrder function is not defined!");
} else {
  console.log("✅ createOrder function loaded successfully");
}

router.post("/add",verifyToken , addToCart);
router.post("/createOrder", verifyTokenOptional, createOrder); // Can be used by both logged-in and guest users (optional auth)
console.log("✅ Route POST /api/cart/createOrder registered");
router.get("/mycart",verifyToken, getUserCart);
router.get("/myorder/:id", verifyToken, getUserOrderById); // Get single order for logged-in user
router.get("/track/:token", trackOrderByToken); // Track order by token (for anonymous users)
router.put("/cancel/:token", cancelOrderByToken); // Cancel order by tracking token (for anonymous users, no auth required)
router.put("/:id", verifyToken, updateCartItem);
router.delete("/:id", verifyToken,  deleteCartItem);

// 🟢 للأدمن
// IMPORTANT: More specific routes must come before parameterized routes
router.get("/all", verifyAdmin, getAllCarts);
router.get("/user/:userId", verifyAdmin, getUserOrders); // Get orders for a specific user

// Test route to verify routes are working (remove after testing)
router.get("/test", (req, res) => {
  res.json({ message: "Cart routes are working!", route: "/api/cart/test" });
});

// Test route for createOrder (to verify it's registered)
router.get("/test-createOrder", (req, res) => {
  res.json({ 
    message: "createOrder route is registered!", 
    route: "/api/cart/createOrder",
    method: "POST",
    functionExists: !!createOrder
  });
});

// Get cart by ID (admin only) - must come after /all and /test
router.get("/:id", verifyAdmin, getCartById);

module.exports = router;
