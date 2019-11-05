const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    description: {
      type: String,
      required: true
    },
    cost: {
      type: Number,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    sumLength: {
      type: Number
    }
  },
  {
    toJSON: { virtuals: true }
  }
);

eventSchema.virtual("talks", {
  ref: "Talk",
  localField: "_id",
  foreignField: "event",
  justOne: false
});

eventSchema.virtual("talksCount", {
  ref: "Talk",
  localField: "_id",
  foreignField: "event",
  count: true
});

module.exports = mongoose.model("Event", eventSchema);
