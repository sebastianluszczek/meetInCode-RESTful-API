const router = require("express").Router();

// import Event model
const Talk = require("../models/Talk");

// @desc    Get all talks
// @route   GET /api/talks
// @route   GET /api/events/:id/talks
router.get("/", async (req, res) => {
  try {
    let talks;
    if (req.params.id) {
      talks = await Talk.find({ event: req.params.id });
    } else {
      talks = await Talk.find({});
    }

    res.status(200).json({
      success: true,
      count: talks.length,
      data: talks
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
router.post("/", async (req, res) => {
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
