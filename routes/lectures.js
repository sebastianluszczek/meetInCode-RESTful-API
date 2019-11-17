const router = require("express").Router();

// import models
const Lecture = require("../models/Lectures");
const Event = require("../models/Event");

// import middleware
const findOneRec = require("../middleware/findOne");
const {
  verifyToken,
  verifyRole,
  verifyOwner
} = require("../middleware/authMiddleware");

// @desc    Get all lectures
// @route   GET /api/lectures
// @route   GET /api/events/:id/lectures
// @access  Public
router.get("/", async (req, res) => {
  try {
    let lectures;
    if (res.result && res.result._id) {
      lectures = await Lecture.find({ event: res.result._id });
    } else {
      lectures = await Lecture.find({});
    }

    res.status(200).json({
      success: true,
      data: res.result,
      count: lectures.length,
      lectures
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @desc    Create new talk
// @route   POST /api/lectures
// @access  Private
router.post(
  "/",
  verifyToken,
  verifyRole("lecturer", "organizer"),
  async (req, res) => {
    try {
      // add logged user to req.body
      req.body.user = req.user.id;

      // check if event, we try add talk to, exist
      const event = await Event.findById(req.body.event);
      if (!event) {
        return res.status(404).json({
          success: false,
          error: `Event, you try add talk to, does not exist.`
        });
      }

      const talk = await Lecture.create(req.body);

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
  }
);

// @desc    Get single talk
// @route   GET /api/talk/:id
// @access  Public
router.get("/:id", findOneRec(Lecture), async (req, res) => {
  res.status(200).json({
    success: true,
    data: res.result
  });
});

// @desc    Update talk
// @route   PUT /api/lectures/:id
// @access  Private
router.put(
  "/:id",
  verifyToken,
  verifyRole("lecturer", "organizer"),
  findOneRec(Lecture),
  verifyOwner,
  async (req, res) => {
    try {
      // update doc
      // instead of .findByIdAndUpdate() manually exchange updated props to run .save() co Lecture.sumLength will be updated
      let user = res.result;
      for (let key in req.body) {
        user[key] =
          res.result[key] !== req.body[key] ? req.body[key] : res.result[key];
      }
      user.save();

      res.status(200).json({
        success: true,
        data: res.result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// @desc    Delete talk
// @route   DELETE /api/lectures/:id
// @access  Private
router.delete(
  "/:id",
  verifyToken,
  verifyRole("lecturer", "organizer"),
  findOneRec(Lecture),
  verifyOwner,
  async (req, res) => {
    try {
      // remove doc
      res.result.remove();

      res.status(200).json({
        success: true,
        data: {}
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
);

module.exports = router;
