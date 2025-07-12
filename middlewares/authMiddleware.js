// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    
    // Add user info to request object
    req.user = decoded;
    
    
    console.log("Token verified, user:", decoded);
    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    return res.status(403).json({
      verified: false,
      message: "Failed to authenticate token"
    });
  }
};

module.exports = { verifyToken };