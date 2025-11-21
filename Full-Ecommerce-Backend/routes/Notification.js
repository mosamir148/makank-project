const express = require("express");
const router = express.Router();
const {
  getUserNotifications,
  getAdminNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
} = require("../controllers/Notification");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");

// User routes - specific routes first
router.get("/user", verifyToken, getUserNotifications);
router.get("/unread-count", verifyToken, getUnreadCount);
router.put("/read-all", verifyToken, markAllAsRead);
router.put("/read/:id", verifyToken, markAsRead);

// Admin routes - specific routes first  
router.get("/admin", verifyAdmin, getAdminNotifications);

// Delete route - must come after all specific routes
router.delete("/:id", verifyToken, deleteNotification);

module.exports = router;

