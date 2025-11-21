const express = require("express");
const {
  createRequest,
  getAllRequests,
  getUserRequests,
  getMyRequests,
  getRequestById,
  updateRequest,
  deleteRequest,
} = require("../controllers/Request");

const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");

const router = express.Router();

// Admin endpoints (must come before generic routes)
router.get("/admin/all", verifyAdmin, getAllRequests);
router.get("/admin/user/:id", verifyAdmin, getUserRequests);
router.put("/admin/:id", verifyAdmin, updateRequest);
router.delete("/admin/:id", verifyAdmin, deleteRequest);

// User endpoints
router.post("/create", verifyToken, createRequest);
router.get("/my-requests", verifyToken, getMyRequests);
router.get("/:id", verifyToken, getRequestById);

module.exports = router;

