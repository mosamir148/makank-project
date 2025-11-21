const Notification = require("../models/Notification");
const User = require("../models/User");
const mongoose = require("mongoose");

// Get notifications for logged-in user
exports.getUserNotifications = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Validate userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate({
        path: "relatedOrder",
        select: "orderNumber status",
        model: "Cart",
        strictPopulate: false
      })
      .populate({
        path: "relatedUser",
        select: "username email",
        model: "User",
        strictPopulate: false
      })
      .lean();

    const totalCount = await Notification.countDocuments({ recipient: userId });

    res.status(200).json({
      notifications,
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
    });
  } catch (err) {
    console.error("Error in getUserNotifications:", err);
    res.status(500).json({ 
      message: "Failed to fetch notifications",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
};

// Get notifications for admin (all admin notifications)
exports.getAdminNotifications = async (req, res) => {
  try {
    // Check if user is authenticated and is admin
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const adminId = req.user._id;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Validate adminId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({ message: "Invalid admin ID" });
    }

    // Get all notifications for this admin (not just order_cancelled)
    const notifications = await Notification.find({ recipient: adminId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate({
        path: "relatedOrder",
        select: "orderNumber status",
        model: "Cart",
        strictPopulate: false
      })
      .populate({
        path: "relatedUser",
        select: "username email",
        model: "User",
        strictPopulate: false
      })
      .lean();

    const totalCount = await Notification.countDocuments({ recipient: adminId });

    res.status(200).json({
      notifications,
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
    });
  } catch (err) {
    console.error("Error in getAdminNotifications:", err);
    res.status(500).json({ 
      message: "Failed to fetch admin notifications",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid notification ID format" });
    }

    // Validate userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Check if notification exists (without recipient check first for better error messages)
    const notificationExists = await Notification.findById(id);
    if (!notificationExists) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Check if notification belongs to user
    const notification = await Notification.findOne({
      _id: id,
      recipient: userId,
    });

    if (!notification) {
      // Notification exists but doesn't belong to this user
      return res.status(403).json({ message: "Notification not found or access denied" });
    }

    // If already read, just return success
    if (notification.isRead) {
      return res.status(200).json({ message: "Notification already marked as read", notification });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({ message: "Notification marked as read", notification });
  } catch (err) {
    console.error("Error in markAsRead:", err);
    res.status(500).json({ 
      message: "Failed to mark notification as read",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipient: userId,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get unread notification count
exports.getUnreadCount = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const userId = req.user._id;

    // Validate userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const count = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });

    res.status(200).json({ unreadCount: count });
  } catch (err) {
    console.error("Error in getUnreadCount:", err);
    res.status(500).json({ 
      message: "Failed to fetch unread count",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
};

// Helper function to create notification (used by other controllers)
exports.createNotification = async ({
  recipientId,
  type,
  title,
  message,
  relatedOrderId = null,
  relatedUserId = null,
  metadata = {},
}) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      type,
      title,
      message,
      relatedOrder: relatedOrderId,
      relatedUser: relatedUserId,
      metadata,
    });
    return notification;
  } catch (err) {
    console.error("Error creating notification:", err);
    return null;
  }
};

// Helper function to notify all admins
exports.notifyAllAdmins = async ({
  type,
  title,
  message,
  relatedOrderId = null,
  relatedUserId = null,
  metadata = {},
}) => {
  try {
    const admins = await User.find({ role: "admin" }).select("_id");
    const notifications = [];

    for (const admin of admins) {
      const notification = await Notification.create({
        recipient: admin._id,
        type,
        title,
        message,
        relatedOrder: relatedOrderId,
        relatedUser: relatedUserId,
        metadata,
      });
      notifications.push(notification);
    }

    return notifications;
  } catch (err) {
    console.error("Error notifying admins:", err);
    return [];
  }
};

