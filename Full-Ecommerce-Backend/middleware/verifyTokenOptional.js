const jwt = require('jsonwebtoken');

// Optional token verification - verifies token if present but doesn't require it
// This is useful for endpoints that support both authenticated and guest users
const verifyTokenOptional = async (req, res, next) => {
  const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(" ")[1]);

  if (!token) {
    // No token provided - continue without setting req.user (for guest users)
    return next();
  }

  jwt.verify(token, process.env.JWTSECRET, async (err, data) => {
    if (err) {
      // Invalid token - continue without setting req.user (for guest users)
      // Don't return error, just continue
      return next();
    }

    // Valid token - set user info
    req.user = { _id: data._id, role: data.role };
    next();
  });
};

module.exports = verifyTokenOptional;














