const User = require("../models/User")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

exports.SignUp = async (req,res)=>{
    try{
        const {email,username,password,phone} = req.body

        const existingUser = await User.findOne({email})
        if(existingUser){
           return res.status(400).json({message:"Email Already Exists"})
        }

        const HashPassword = await bcrypt.hash(password,10)
        const NewUser = new User({
            email,
            username,
            phone,
            password:HashPassword,
            image: req.file ? req.file.path : null
        })
         await NewUser.save()
         const {password:_, _id, ...info} = NewUser._doc
        res.status(201).json({ message: "User Created Successfully!" ,User: info})

    }catch(err){
        res.status(500).json(err)``
    }
}


exports.Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(404).json({ message: "Email and Password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Email or Password is incorrect" });
    }

    const MatchPassword = await bcrypt.compare(password, user.password);
    if (!MatchPassword) {
      return res.status(400).json({ message: "Email or Password is incorrect" });
    }

    const token = jwt.sign(
      { 
        _id: user._id,
         username: user.username, 
         email: user.email ,
         role: user.role  
      },
      process.env.JWTSECRET,
      { expiresIn: "3d" }
    );

    const { password: _, _id, ...info } = user._doc;

    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "None",
        secure: true, 
      })
      .status(200)
      .json({ token, info });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


exports.LogOut = async (req, res) => {
  try {
    res
      .clearCookie("token", {
        httpOnly: true, 
        sameSite: "None",
        secure: true, 
        path: "/",
      })
      .status(200)
      .json("User logged out successfully!");
  } catch (err) {
    res.status(500).json({ message: "Logout error" });
  }
};



exports.Refetch = async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, process.env.JWTSECRET, {}, async (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });

    try {
      const user = await User.findById(decoded._id).select("-password -_id");
      if (!user) return res.status(404).json({ message: "User not found" });

      // Convert to plain object and ensure _id is not included
      const userObj = user.toObject();
      delete userObj._id;
      
      res.status(200).json(userObj);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });
};

exports.GetUsers = async (req,res)=>{
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        console.log("GetUsers API - Request params:", { page, limit, skip });
        console.log("Query params received:", req.query);

        const totalCount = await User.countDocuments();
        
        const Users = await User.find()
            .skip(skip)
            .limit(limit)
            .select("-password")
            .lean();

        console.log("GetUsers API - Returning:", {
            usersCount: Users.length,
            totalCount,
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit)
        });

        res.status(200).json({
            Users,
            totalCount,
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit)
        });
    }catch(err){
        console.error("GetUsers API Error:", err);
        res.status(500).json({message:err.message || err})
    }
}

exports.GetUser = async (req,res)=>{
    try{
        const getUser = await User.findById(req.params.id)
        if (!getUser) {
            return res.status(404).json({ message: "User not found" });
        }
        const {password, _id, ...info} = getUser._doc
        res.status(200).json({info})

    }catch(err){
        res.status(500).json({message:err})
    }
}

exports.UpdateUser = async (req,res) =>{
  try {
    const updateData = { ...req.body };

    // If verifyToken is used (not verifyAdmin), ensure user can only update their own profile
    if (req.user && req.user._id && req.user.role !== 'admin') {
      if (req.params.id !== req.user._id.toString()) {
        return res.status(403).json({ message: "You can only update your own profile" });
      }
    }

    // Get old user data to compare changes
    const oldUser = await User.findById(req.params.id);
    if (!oldUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.file) updateData.image = req.file.path;

    // Hash password if provided
    if (updateData.password) {
      const bcrypt = require("bcrypt");
      const hashedPassword = await bcrypt.hash(updateData.password, 10);
      updateData.password = hashedPassword;
    }

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    // If admin updated user info, notify the user
    if (req.user.role === "admin" && req.params.id !== req.user._id.toString()) {
      const { createNotification } = require("./Notification");
      
      // Check what fields were changed
      const changedFields = [];
      if (updateData.username && oldUser.username !== updateData.username) {
        changedFields.push("username");
      }
      if (updateData.email && oldUser.email !== updateData.email) {
        changedFields.push("email");
      }
      if (updateData.phone && oldUser.phone !== updateData.phone) {
        changedFields.push("phone");
      }
      if (updateData.address && oldUser.address !== updateData.address) {
        changedFields.push("address");
      }
      if (updateData.image) {
        changedFields.push("profile image");
      }

      if (changedFields.length > 0) {
        await createNotification({
          recipientId: req.params.id,
          type: "user_info_updated",
          title: "Profile Information Updated",
          message: `Admin has updated your ${changedFields.join(", ")}. Please review your profile information.`,
          relatedUserId: req.params.id,
          metadata: {
            changedFields,
            updatedBy: req.user._id,
          },
        });
      }
    }

    const { password, _id, ...info } = updated._doc;
    res.status(200).json({ message: "User Updated Successfully", info });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.DeleteUser = async (req,res)=>{
    try{
        await User.findByIdAndDelete(req.params.id)
        res.status(200).json({ message: "User deleted successfully"});
    }catch(err){
        res.status(500).json({message:err})
    }
}


exports.ForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });


    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = Date.now() + 10 * 60 * 1000; 

    user.resetOTP = otp;
    user.resetOTPExpires = otpExpire;
    await user.save();


    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      to: user.email,
      subject: "Password Reset OTP",
      text: `Your OTP code is: ${otp}. It will expire in 10 minutes.`,
    });

    res.status(200).json({ message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.ResetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({
      email,
      resetOTP: otp,
      resetOTPExpires: { $gt: Date.now() }, 
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired OTP" });


    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;


    user.resetOTP = null;
    user.resetOTPExpires = null;

    await user.save();

    res.status(200).json({ message: "Password reset successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

