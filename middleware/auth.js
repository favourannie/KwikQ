const organizationModel = require("../models/organizationModel");
const jwt = require("jsonwebtoken");

exports.checkLogin = (req, res, next) => {
    try {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({
      message: "Kindly login"
    });
  }
    const checkValidToken = jwt.verify(token.split(" ")[1],process.env.JWT_SECRET, async (error, result) =>{
        if(error){
            return res.status(401).json({
                message: "Login seession expired, please login again"
            });
        }else{
            const user = await organizationModel.findById(result.id);
        
            req.user = user._id;
            next();
        }
    });
} catch (error) {
  res.status(500).json({
    message: "Internal Server Error"
  });
}
};
exports.authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check if header exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "No token provided. Please log in.",
      });
    }

    // Extract the token (Bearer <token>)
    const token = authHeader.split(" ")[1];

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by ID stored in token
    const user = await organizationModel.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found. Please log in again.",
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        message: "Session expired. Please log in again.",
      });
    }

    return res.status(500).json({
      message: "Authentication failed",
      error: error.message,
    });
  }
};

// 🧠 Middleware to check admin privileges
exports.adminAuth = (req, res, next) => {
  if (!req.user || req.user.isAdmin !== true) {
    return res.status(403).json({
      message: "You are not authorized to perform this action.",
    });
  }
  next();
};