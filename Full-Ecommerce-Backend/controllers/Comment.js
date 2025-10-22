const Comment = require("../models/Comment");

// 🟢 إضافة تعليق
exports.addComment = async (req, res) => {
  try {
    const { productId, comment } = req.body;
    const userId = req.user._id;

    if (!productId || !comment) {
      return res.status(400).json({ message: "ProductId and Comment are required" });
    }

    const newComment = await Comment.create({
      user: userId,
      product: productId,
      comment,
    });

    await newComment.populate("user", "username email");
    await newComment.populate("product", "title price");

    res.status(201).json(newComment);
  } catch (error) {
    console.error("AddComment Error:", error);
    res.status(500).json({ message: "Error adding comment", error });
  }
};

// 🟢 جلب كل التعليقات الخاصة بمنتج
exports.getProductComments = async (req, res) => {
  try {
    const { productId } = req.params;

    const comments = await Comment.find({ product: productId })
      .populate("user", "username email")
      .populate("product", "title price");

    res.status(200).json(comments);
  } catch (error) {
    console.error("GetProductComments Error:", error);
    res.status(500).json({ message: "Error fetching product comments", error });
  }
};

// 🟢 جلب كل التعليقات (Admin فقط)
exports.getAllComments = async (req, res) => {
  try {
    const comments = await Comment.find()
      .populate("user", "username email")
      .populate("product", "title price");

    res.status(200).json(comments);
  } catch (error) {
    console.error("GetAllComments Error:", error);
    res.status(500).json({ message: "Error fetching comments", error });
  }
};

// 🟢 حذف تعليق (Admin فقط)
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    await Comment.findByIdAndDelete(id);

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("DeleteComment Error:", error);
    res.status(500).json({ message: "Error deleting comment", error });
  }
};
