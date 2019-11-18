const router = require("express").Router();

// import models
const Lecture = require("../models/Lectures");
const Event = require("../models/Event");
const Rating = require("../models/Rating");

// import middleware
const findOneRec = require("../middleware/findOne");
const {
  verifyToken,
  verifyRole,
  verifyOwner
} = require("../middleware/authMiddleware");

// @desc    Create new rating
// @route   POST /api/rating
// @access  Private
router.post("/", verifyToken, async (req, res) => {
  try {
    // add logged user to req.body
    req.body.user = req.user.id;

    let doc;
    if (req.body.docType === "Event") {
      doc = await Event.findById(req.body.doc);
    } else if (req.body.docType === "Lecture") {
      doc = await Lecture.findById(req.body.doc);
    } else {
      return res.status(400).json({
        success: false,
        error: `You have to specify resource (event or lecture) to rate.`
      });
    }
    // check if resource (event or lecture), we try add rating to, does exist
    if (!doc) {
      return res.status(404).json({
        success: false,
        error: `Resource, you try add rating to, does not exist.`
      });
    }

    const rating = await Rating.create(req.body);

    res.status(200).json({
      success: true,
      data: rating
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error
    });
  }
});

module.exports = router;
