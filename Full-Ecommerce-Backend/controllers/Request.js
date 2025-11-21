const Request = require("../models/Request");
const User = require("../models/User");

// Create a new request
exports.createRequest = async (req, res) => {
  try {
    const { subject, message, email, phone } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
        status: 401,
        error: "User not authenticated",
      });
    }

    if (!subject || !message || !email) {
      return res.status(400).json({
        message: "Subject, message, and email are required",
        status: 400,
        error: "Missing required fields",
      });
    }

    const request = await Request.create({
      user: userId,
      subject,
      message,
      email,
      phone: phone || null,
      status: "Pending",
    });

    const populatedRequest = await Request.findById(request._id)
      .populate("user", "username email phone")
      .select("-__v");

    res.status(201).json({
      message: "Request created successfully",
      status: 201,
      request: populatedRequest,
    });
  } catch (err) {
    console.error("Error creating request:", err);
    res.status(500).json({
      message: "Failed to create request",
      status: 500,
      error: err.message,
    });
  }
};

// Get all requests (Admin only)
exports.getAllRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    if (status) {
      query.status = status;
    }

    const requests = await Request.find(query)
      .populate("user", "username email phone")
      .populate("respondedBy", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select("-__v");

    const totalCount = await Request.countDocuments(query);

    res.status(200).json({
      message: "Requests retrieved successfully",
      status: 200,
      requests,
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
    });
  } catch (err) {
    console.error("Error fetching requests:", err);
    res.status(500).json({
      message: "Failed to fetch requests",
      status: 500,
      error: err.message,
    });
  }
};

// Get requests by user ID (Admin only)
exports.getUserRequests = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    if (!id) {
      return res.status(400).json({
        message: "User ID is required",
        status: 400,
        error: "Missing user ID",
      });
    }

    const requests = await Request.find({ user: id })
      .populate("user", "username email phone")
      .populate("respondedBy", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select("-__v");

    const totalCount = await Request.countDocuments({ user: id });

    res.status(200).json({
      message: "User requests retrieved successfully",
      status: 200,
      requests,
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
    });
  } catch (err) {
    console.error("Error fetching user requests:", err);
    res.status(500).json({
      message: "Failed to fetch user requests",
      status: 500,
      error: err.message,
    });
  }
};

// Get user's own requests
exports.getMyRequests = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
        status: 401,
        error: "User not authenticated",
      });
    }

    const requests = await Request.find({ user: userId })
      .populate("respondedBy", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select("-__v");

    const totalCount = await Request.countDocuments({ user: userId });

    res.status(200).json({
      message: "Requests retrieved successfully",
      status: 200,
      requests,
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
    });
  } catch (err) {
    console.error("Error fetching user requests:", err);
    res.status(500).json({
      message: "Failed to fetch requests",
      status: 500,
      error: err.message,
    });
  }
};

// Get single request by ID
exports.getRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    const userRole = req.user?.role;

    if (!id) {
      return res.status(400).json({
        message: "Request ID is required",
        status: 400,
        error: "Missing request ID",
      });
    }

    const request = await Request.findById(id)
      .populate("user", "username email phone")
      .populate("respondedBy", "username email")
      .select("-__v");

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
        status: 404,
        error: "Request does not exist",
      });
    }

    // Check if user has permission to view this request
    if (userRole !== "admin" && request.user._id.toString() !== userId?.toString()) {
      return res.status(403).json({
        message: "Access denied",
        status: 403,
        error: "You don't have permission to view this request",
      });
    }

    res.status(200).json({
      message: "Request retrieved successfully",
      status: 200,
      request,
    });
  } catch (err) {
    console.error("Error fetching request:", err);
    res.status(500).json({
      message: "Failed to fetch request",
      status: 500,
      error: err.message,
    });
  }
};

// Update request status and response (Admin only)
exports.updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, response } = req.body;
    const adminId = req.user?._id;

    if (!id) {
      return res.status(400).json({
        message: "Request ID is required",
        status: 400,
        error: "Missing request ID",
      });
    }

    const request = await Request.findById(id);
    if (!request) {
      return res.status(404).json({
        message: "Request not found",
        status: 404,
        error: "Request does not exist",
      });
    }

    const updateData = {};
    if (status) {
      updateData.status = status;
    }
    if (response !== undefined) {
      updateData.response = response;
      updateData.respondedBy = adminId;
      updateData.respondedAt = new Date();
    }

    const updatedRequest = await Request.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("user", "username email phone")
      .populate("respondedBy", "username email")
      .select("-__v");

    res.status(200).json({
      message: "Request updated successfully",
      status: 200,
      request: updatedRequest,
    });
  } catch (err) {
    console.error("Error updating request:", err);
    res.status(500).json({
      message: "Failed to update request",
      status: 500,
      error: err.message,
    });
  }
};

// Delete request (Admin only)
exports.deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Request ID is required",
        status: 400,
        error: "Missing request ID",
      });
    }

    const request = await Request.findById(id);
    if (!request) {
      return res.status(404).json({
        message: "Request not found",
        status: 404,
        error: "Request does not exist",
      });
    }

    await Request.findByIdAndDelete(id);

    res.status(200).json({
      message: "Request deleted successfully",
      status: 200,
    });
  } catch (err) {
    console.error("Error deleting request:", err);
    res.status(500).json({
      message: "Failed to delete request",
      status: 500,
      error: err.message,
    });
  }
};

