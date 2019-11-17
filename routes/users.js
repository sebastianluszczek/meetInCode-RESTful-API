const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// import Event model
const User = require("../models/User");

// import middleware
const { verifyToken } = require("../middleware/authMiddleware");

// @desc    Get current logged user
// @route   GET /api/users/me
// @access  Private
router.get("/me", verifyToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({ path: "events", select: "name" })
      .populate({ path: "lectures", select: "name" });
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

// @desc    Update user details
// @route   GET /api/users/updatedetails
// @access  Private
router.put("/updatedetails", verifyToken, async (req, res, next) => {
  // only name could be updated (in future avatar too)
  const details = {
    name: req.body.name
  };
  try {
    const user = await User.findByIdAndUpdate(req.user.id, details, {
      new: true,
      runValidators: true
    });
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

// @desc    Update user password
// @route   GET /api/users/updatepassword
// @access  Private
router.put("/updatepassword", verifyToken, async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  try {
    // check if current & new passwords are provided
    if (!currentPassword || !newPassword) {
      return res.status(404).json({
        success: false,
        error:
          "Both, current & new password have to be provided to change password"
      });
    }

    // get user to get it with hashed password
    const user = await User.findById(req.user.id).select("+password");

    // validate provided current password
    const validation = await bcrypt.compare(currentPassword, user.password);
    if (!validation) {
      return res.status(401).json({
        success: false,
        error: "Credential error - provided wrong current password"
      });
    }

    // change password
    user.password = newPassword;
    user.save({ validateBeforeSave: false });

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
      message: "Password successfully changed."
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error
    });
  }
});

// @desc    Delete user
// @route   DELETE /api/users/delete
// @access  Private
router.delete("/delete", verifyToken, async (req, res, next) => {
  try {
    await User.findByIdAndRemove(req.user.id);
    req.user = undefined;
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error
    });
  }
});

module.exports = router;
