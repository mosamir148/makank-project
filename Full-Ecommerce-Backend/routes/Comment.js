const express = require("express");
const { 
  addComment, 
  getProductComments, 
  getAllComments, 
  deleteComment 
} = require("../controllers/Comment");

const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");

const router = express.Router();

// 🟢 إضافة تعليق (User)
router.post("/add", verifyToken, addComment);

// 🟢 جلب كل التعليقات لمنتج معين
router.get("/product/:productId",verifyToken, getProductComments);

// 🟢 جلب كل التعليقات (Admin)
router.get("/all", verifyAdmin, getAllComments);

// 🟢 حذف تعليق (Admin)
router.delete("/:id", verifyAdmin, deleteComment);

module.exports = router;
