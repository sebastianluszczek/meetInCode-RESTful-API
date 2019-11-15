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
    req.user = await User.findById(verified.id);
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: "Not authorized to access this route"
    });
  }
};
