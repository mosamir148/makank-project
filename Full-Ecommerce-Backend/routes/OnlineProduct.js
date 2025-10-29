const express = require("express");
const {GetProducts,CreateProduct,DeleteProduct,UpdateProduct,GetProduct} = require("../controllers/OnlineProduct");

const upload = require("../middleware/cloudinary");
const verifyAdmin = require("../middleware/verifyAdmin");
const router = express.Router();

router.get("/", GetProducts);
router.get("/:id",GetProduct);

router.post("/",verifyAdmin, upload.fields([
    { name: "image", maxCount: 1 },   
    { name: "images", maxCount: 5 }   
  ]), CreateProduct);

router.delete("/:id",verifyAdmin, DeleteProduct);

router.put("/:id",verifyAdmin ,upload.fields([
    { name: "image", maxCount: 1 },   
    { name: "images", maxCount: 5 }   
  ]), UpdateProduct);

module.exports = router;
