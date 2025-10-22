// Cart.js
const express = require("express");
const {
  addToCart,
  getUserCart,
  getAllCarts,
  updateCartItem,
  deleteCartItem,
} = require("../controllers/Cart");
const verifyAdmin = require("../middleware/verifyAdmin");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

router.post("/add",verifyToken , addToCart);
router.get("/mycart",verifyToken, getUserCart);
router.put("/:id", verifyToken, updateCartItem);
router.delete("/:id", verifyToken,  deleteCartItem);

// 🟢 للأدمن
router.get("/all",verifyAdmin , getAllCarts);

module.exports = router;
