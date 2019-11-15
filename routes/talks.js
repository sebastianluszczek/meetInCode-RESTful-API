const router = require("express").Router();

// import Event model
const Talk = require("../models/Talk");

// import middleware
const { verifyToken } = require("../middleware/authMiddleware");

// @desc    Get all talks
// @route   GET /api/talks
// @route   GET /api/events/:id/talks
// @access  Public
router.get("/", async (req, res) => {
  try {
    let talks;
    if (res.result && res.result._id) {
      talks = await Talk.find({ event: res.result._id });
    } else {
      talks = await Talk.find({});
    }

    res.status(200).json({
      success: true,
      data: res.result,
      count: talks.length,
      talks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @desc    Create new talk
// @route   POST /api/talks
// @access  Private
router.post("/", verifyToken, async (req, res) => {
  try {
    const talk = await Talk.create(req.body);

    res.status(200).json({
      success: true,
      data: talk
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
