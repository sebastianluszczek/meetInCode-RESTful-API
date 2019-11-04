const mongoose = require("mongoose");

const talkSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  length: {
    type: Number,
    required: true
  },
  event: {
    type: mongoose.Schema.ObjectId,
    ref: "Event",
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Talk", talkSchema);
