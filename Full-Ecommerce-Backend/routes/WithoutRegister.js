const express = require("express");
const router = express.Router();
const { createWithoutUserAndCart,deleteCartItem, getWithoutUsers ,updateCartStatus ,updateUserStatus} = require("../controllers/WithoutRegister");
const verifyAdmin = require("../middleware/verifyAdmin");


router.post("/withoutOrder", createWithoutUserAndCart);


router.get("/getWithoutUsers", verifyAdmin, getWithoutUsers);

router.put("/updateCartStatus/:cartId", updateCartStatus);
router.put("/updateUserStatus/:userId", updateUserStatus);

router.delete("/deleteCartItem/:cartId", deleteCartItem);


module.exports = router;
