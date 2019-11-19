const router = require("express").Router();

// import Event model
const User = require("../models/User");

// import middleware
const {
  verifyToken,
  verifyRole,
  verifyOwner
} = require("../middleware/authMiddleware");
const findOneRec = require("../middleware/findOne");

// file global middleware
router.use(verifyToken);
router.use(verifyRole());

// @desc    Get all users
// @route   GET /api/users
// @access  Private - admin
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({
      success: false,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private - admin
router.get("/:id", findOneRec(User), async (req, res) => {
  res.status(200).json({
    success: true,
    data: res.result
  });
});

// @desc    Create new user
// @route   POST /api/users
// @access  Private - admin
router.post("/", async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(200).json({
      success: false,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private - admin
router.put("/:id", findOneRec(User), async (req, res) => {
  // if user role is admin, only owner could update/delete data
  if (res.result.role === "admin" && req.user.id !== res.result.id) {
    return res.status(401).json({
      success: false,
      error: "You have no permission to access this route."
    });
  }
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.status(200).json({
      success: false,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private - admin
router.delete("/:id", findOneRec(User), async (req, res) => {
  // if user role is admin, only owner could update/delete data
  if (res.result.role === "admin" && req.user.id !== res.result.id) {
    return res.status(401).json({
      success: false,
      error: "You have no permission to access this route."
    });
  }
  try {
    res.result.remove();
    res.status(200).json({
      success: false,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
