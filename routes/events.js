const router = require("express").Router();

// import models
const Event = require("../models/Event");
const Rating = require("../models/Rating");

// import middleware
const findOneRec = require("../middleware/findOne");
const {
  verifyToken,
  verifyRole,
  verifyOwner
} = require("../middleware/authMiddleware");

// @desc    Get all events
// @route   GET /api/events
// @access  Public
router.get("/", async (req, res) => {
  const reqQuery = { ...req.query };

  // exclude fields from query
  const removeFields = ["select", "sort", "page", "limit"];
  removeFields.forEach(param => delete reqQuery[param]);

  // make query stringe readable for mongoose
  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  let query = Event.find(JSON.parse(queryStr));

  // select fields to display
  if (req.query.select) {
    const selectFields = req.query.select.split(",").join(" ");
    query = query.select(selectFields);
  }

  // sort by
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createAt");
  }

  // pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Event.countDocuments();

  const newFullUrl = (val = 1) =>
    `${req.protocol}://${req.get(
      "host"
    )}/api/events/?limit=${limit}&page=${page + val}`;

  query = query.skip(startIndex).limit(limit);
  const pagination = {};
  if (endIndex < total) {
    pagination.next = {
      page: newFullUrl(+1)
    };
  }
  if (startIndex > 0) {
    pagination.prev = {
      page: newFullUrl(-1)
    };
  }
  // populate
  // query = query.populate({
  //   path: "lectures",
  //   select: "name description length"
  // });
  //   .populate("lecturesCount");

  try {
    const events = await query;

    res.status(200).json({
      success: true,
      count: events.length,
      pagination,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @desc    Create new event
// @route   POST /api/events
// @access  Private
router.post("/", verifyToken, verifyRole("organizer"), async (req, res) => {
  try {
    // add logged user to req.body
    req.body.user = req.user.id;

    const event = await Event.create(req.body);

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// @desc    Create lecture connected to specific event
// @route   POST /api/events/:id/lectures
// @access  Private
router.use("/:id/lectures", findOneRec(Event), require("./lectures"));

// @desc    Sign user as participants to specific event
// @route   POST /api/events/:id/participate
// @access  Private
router.put(
  "/:id/participate",
  verifyToken,
  findOneRec(Event),
  async (req, res) => {
    try {
      req.body.participants = [
        ...res.result.participants,
        { user: req.user.id }
      ];
      const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
      });

      res.status(200).json({
        success: true,
        data: event
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
);

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate("lectures");
    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(400).json({
      success: true,
      error
    });
  }
});

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private
router.put(
  "/:id",
  verifyToken,
  verifyRole("organizer"),
  findOneRec(Event),
  verifyOwner,
  async (req, res) => {
    try {
      const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
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

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private
router.delete(
  "/:id",
  verifyToken,
  verifyRole("organizer"),
  findOneRec(Event),
  verifyOwner,
  async (req, res) => {
    try {
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

// @desc    Add event rating
// @route   POST /api/events/:id/ratings
// @access  Private
router.post(
  "/:id/ratings",
  verifyToken,
  findOneRec(Event),
  async (req, res) => {
    try {
      // add logged user to req.body
      req.body.user = req.user.id;
      req.body.doc = res.result._id;
      req.body.docType = "Event";

      const rating = await Rating.create(req.body);

      res.status(200).json({
        success: true,
        data: rating
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          error: `You have rated this resource already`
        });
      }
      res.status(400).json({
        success: false,
        error: error
      });
    }
  }
);

module.exports = router;
