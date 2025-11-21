const express = require("express")
const { SignUp, Login, LogOut, Refetch,ForgotPassword,ResetPassword, GetUser, DeleteUser, GetUsers, UpdateUser } = require("../controllers/User")
const router = express.Router()
const upload = require("../middleware/cloudinary");
const verifyAdmin = require("../middleware/verifyAdmin");
const verifyToken = require("../middleware/verifyToken");

router.post("/signUp" , upload.single("image") , SignUp)
router.post("/login", Login);
router.get("/logout", LogOut);
router.get("/refetch", Refetch);

// public endpoints

router.post("/forgot-password", ForgotPassword);
router.post("/reset-password", ResetPassword);

// admin-protected endpoints

router.get("/getUsers",verifyAdmin, GetUsers);
router.get("/getUser/:id",verifyAdmin, GetUser);
router.delete("/delete/:id",verifyAdmin, DeleteUser);
router.put("/update/:id",verifyAdmin, upload.single("image"), UpdateUser);
// User can update their own profile
router.put("/update-profile/:id", verifyToken, upload.single("image"), UpdateUser);



module.exports = router