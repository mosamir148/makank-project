const express = require("express");
const router = express.Router();
const { createWithoutUserAndCart, getWithoutUsers ,updateCartStatus ,updateUserStatus} = require("../controllers/WithoutRegister");
const verifyAdmin = require("../middleware/verifyAdmin");


router.post("/withoutOrder", createWithoutUserAndCart);


router.get("/getWithoutUsers", verifyAdmin, getWithoutUsers);

router.put("/updateCartStatus/:cartId", updateCartStatus);
router.put("/updateUserStatus/:userId", updateUserStatus);


module.exports = router;
