const router = require("express").Router();

// import Event model
const Event = require("../models/Event");

// import middleware
const findOneRec = require("../middleware/findOne");

router.use((req, res, next) => {
  console.log(req.params);

  next();
});

// include other resource router
const talksRouter = require("./talks");
router.use("/:id/talks", talksRouter);

// @desc    Get all events
// @route   GET /api/events
router.get("/", async (req, res) => {
  const reqQuery = { ...req.query };

  // exclude fields from query
  const removeFields = ["select", "sort"];
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

  try {
    const events = await query.populate({
      path: "talks",
      select: "name description"
    });

    res.status(200).json({
      success: true,
      count: events.length,
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
router.post("/", async (req, res) => {
  try {
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

// @desc    Get single event
// @route   GET /api/events/:id
router.get("/:id", findOneRec(Event), async (req, res) => {
  res.status(200).json({
    success: true,
    data: res.result
  });
});

// @desc    Update event
// @route   PUT /api/events/:id
router.put("/:id", findOneRec(Event), async (req, res) => {
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
});

// @desc    Delete event
// @route   DELETE /api/events/:id
router.delete("/:id", findOneRec(Event), async (req, res) => {
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
});

module.exports = router;
