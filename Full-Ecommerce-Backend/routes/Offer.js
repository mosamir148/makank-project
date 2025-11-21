const express = require("express");
const {
  createOffer,
  getAllOffers,
  getOfferById,
  updateOffer,
  deleteOffer,
  getActiveOffers
} = require("../controllers/Offer");

const verifyAdmin = require("../middleware/verifyAdmin");
const router = express.Router();

// Public routes (must be before /:id route)
router.get("/active", getActiveOffers);

// Admin routes
router.get("/", verifyAdmin, getAllOffers);
router.post("/", verifyAdmin, createOffer);
router.put("/:id", verifyAdmin, updateOffer);
router.delete("/:id", verifyAdmin, deleteOffer);

// Public route (must be last to avoid matching /active)
router.get("/:id", getOfferById);

module.exports = router;

