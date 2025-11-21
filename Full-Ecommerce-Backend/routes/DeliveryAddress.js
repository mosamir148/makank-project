const express = require("express");
const {
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getDefaultAddress,
} = require("../controllers/DeliveryAddress");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

// All routes require authentication
router.get("/", verifyToken, getUserAddresses);
router.get("/default", verifyToken, getDefaultAddress);
router.post("/", verifyToken, createAddress);
router.put("/:id", verifyToken, updateAddress);
router.delete("/:id", verifyToken, deleteAddress);
router.put("/:id/set-default", verifyToken, setDefaultAddress);

module.exports = router;















