const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// import Event model
const User = require("../models/User");

// import middleware
const { verifyToken } = require("../middleware/authMiddleware");

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
router.post("/register", async (req, res) => {
  const { name, email, role, password } = req.body;

  try {
    // check if email in database
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(401).json({
        success: false,
        error: "Credential error - email already exist in DB"
      });
    }

    const user = await User.create({
      name,
      email,
      role,
      password
    });

    // sign token
    const token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET
    );

    res.status(201).json({
      success: true,
      token,
      msg: "New user created"
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // check if email and password provided
  if (!email || !password) {
    return res.status(401).json({
      success: false,
      error: "Credential error - no email or password provided"
    });
  }

  // check if email in database
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return res.status(401).json({
      success: false,
      error: "Credential error - no matching email id DB"
    });
  }

  // validate password
  const validation = await bcrypt.compare(password, user.password);
  if (!validation) {
    return res.status(401).json({
      success: false,
      error: "Credential error - wrong password"
    });
  }

  // sign token
  const token = jwt.sign(
    {
      _id: user._id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET
  );

  res.status(200).json({
    success: true,
    token,
    msg: "Logged in"
  });
});

// @desc    Get current logged user
// @route   GET /api/auth/me
// @access  Private
router.get("/me", verifyToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({ path: "events", select: "name" })
      .populate({ path: "talks", select: "name" });
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error
    });
  }
});

module.exports = router;
