const router = require("express").Router();

// import models
const Talk = require("../models/Talk");
const Event = require("../models/Event");

// import middleware
const findOneRec = require("../middleware/findOne");
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");

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
router.post(
  "/",
  verifyToken,
  verifyRole("author", "admin"),
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
  }
);

// @desc    Get single talk
// @route   GET /api/talk/:id
// @access  Public
router.get("/:id", findOneRec(Talk), async (req, res) => {
  res.status(200).json({
    success: true,
    data: res.result
  });
});

// @desc    Update talk
// @route   PUT /api/talks/:id
// @access  Private
router.put(
  "/:id",
  verifyToken,
  verifyRole("author", "admin"),
  findOneRec(Talk),
  async (req, res) => {
    // check if current logged user is an owner of doc or admin
    if (
      res.result.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(400).json({
        success: false,
        error: `User ${req.user.id} is not owner of document or admin`
      });
    }

    try {
      // update doc
      const event = await Talk.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
      });

      res.status(200).json({
        success: true,
        data: event
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
// @route   DELETE /api/talks/:id
// @access  Private
router.delete(
  "/:id",
  verifyToken,
  verifyRole("author", "admin"),
  findOneRec(Talk),
  async (req, res) => {
    // check if current logged user is an owner of doc or admin
    if (
      res.result.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(400).json({
        success: false,
        error: `User ${req.user.id} is not owner of document or admin`
      });
    }

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
