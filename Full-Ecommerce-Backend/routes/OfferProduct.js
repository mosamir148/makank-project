const express = require("express");
const {getActiveOffers,addOffer,updateOffer,deleteOffer,getOfferById} = require("../controllers/OfferProduct");

const upload = require("../middleware/cloudinary");
const verifyAdmin = require("../middleware/verifyAdmin");
const router = express.Router();


router.get("/", getActiveOffers);
router.get("/:id", getOfferById);

router.post("/",verifyAdmin, upload.fields([
    { name: "image", maxCount: 1 },   
    { name: "images", maxCount: 5 }   
  ]), addOffer);
router.delete("/:id",verifyAdmin, deleteOffer);

router.put("/:id",verifyAdmin ,upload.fields([
    { name: "image", maxCount: 1 },   
    { name: "images", maxCount: 5 }   
  ]), updateOffer);

module.exports = router;
