const express = require("express");
const {
  addToWishlist,
  getUserWishlist,
  getAllWishlists,
  deleteWishlistItem,
  updateWishlistItem,
} = require("../controllers/Wishlist");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");

const router = express.Router();

router.post("/add", verifyToken, addToWishlist);
router.get("/mywishlist", verifyToken, getUserWishlist);
router.put("/:id", verifyToken, updateWishlistItem);
router.delete("/:id", verifyToken, deleteWishlistItem);

// للأدمن
router.get("/all", verifyAdmin, getAllWishlists);

module.exports = router;
