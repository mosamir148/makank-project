const express = require("express");
const router = express.Router();
const {
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getAllCoupons,
  validateCoupon,
} = require("../controllers/CouponController");

// 🔒 للادمن
router.post("/", createCoupon);
router.put("/:id", updateCoupon);
router.delete("/:id", deleteCoupon);
router.get("/", getAllCoupons);

// 🟢 للمستخدم
router.post("/validate", validateCoupon);

module.exports = router;
