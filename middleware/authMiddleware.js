const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Event = require("../models/Event");

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
  // check if user role includes in roles with permission or if it is  admin role
  if (!roles.includes(req.user.role) && req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      error: `User ${req.user.id} role '${req.user.role}' is not authorized to access this route`
    });
  }
  next();
};

exports.verifyOwner = async (req, res, next) => {
  // check if current logged user is an owner of doc or admin
  if (res.result.user.toString() !== req.user.id && req.user.role !== "admin") {
    // check if this is lecture
    if (res.result.event) {
      // find owner of event this lecture is associated
      const event = await Event.findById(res.result.event);

      // if logged user an owner of event proceed (he might edit lectures too)
      if (event.user.toString() === req.user.id) {
        return next();
      }
    }

    return res.status(400).json({
      success: false,
      error: `User ${req.user.id} is not owner of this document`
    });
  }
  next();
};
