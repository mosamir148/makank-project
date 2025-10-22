// middleware/verifyAdmin.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(" ")[1]);
    if (!token) return res.status(401).json({ message: "You are not authenticated!" });

    jwt.verify(token, process.env.JWTSECRET, async (err, decoded) => {
      if (err) return res.status(403).json({ message: "Token is not valid!" });

      const user = await User.findById(decoded._id);
      if (!user) return res.status(404).json({ message: "User not found" });
      if (user.role !== "admin") return res.status(403).json({ message: "Access denied. Admins only." });

      req.userId = user._id;
      req.userRole = user.role;
      next();
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = verifyAdmin;
