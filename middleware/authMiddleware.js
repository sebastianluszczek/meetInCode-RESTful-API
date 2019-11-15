const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.verifyToken = async (req, res, next) => {
  let token;
  const authorization = req.headers.authorization;

  // check if authorization header & it start with 'Bearer'
  if (authorization && authorization.startsWith("Bearer")) {
    token = authorization.split(" ")[1];
  }

  // check if token
  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Not authorized to access this route"
    });
  }

  try {
    // verify token
    const verified = await jwt.verify(token, process.env.JWT_SECRET);

    // add logged user to req.user
    req.user = await User.findById(verified._id);
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: "Not authorized to access this route"
    });
  }
};

exports.verifyRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    res.status(403).json({
      success: false,
      error: `Your role '${req.user.role}' is not authorized to access this route`
    });
  }
  next();
};
