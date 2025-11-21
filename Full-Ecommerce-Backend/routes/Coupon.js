const express = require("express");
const { validateCoupon } = require("../controllers/Offer");

const router = express.Router();

// Public route for coupon validation
router.post("/validate", validateCoupon);

module.exports = router;





