const mongoose = require("mongoose");

const lectureSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add Lecture name"]
  },
  description: {
    type: String,
    required: [true, "Please add Lecture description"]
  },
  length: {
    type: Number,
    required: [true, "Please add Lecture length in hours"]
  },
  event: {
    type: mongoose.Schema.ObjectId,
    ref: "Event",
    required: [
      true,
      "You have to provide Event id this Lecture is associated with"
    ]
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true
  },
  avgRating: {
    type: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Static method to get sum of length
lectureSchema.statics.getSumLength = async function(eventId) {
  const obj = await this.aggregate([
    {
      $match: { event: eventId }
    },
    {
      $group: {
        _id: "$event",
        sumLength: { $sum: "$length" }
      }
    }
  ]);

  try {
    await this.model("Event").findByIdAndUpdate(eventId, {
      sumLength: obj[0].sumLength
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getSumLength after save
lectureSchema.post("save", function() {
  this.constructor.getSumLength(this.event);
});

// Call getSumLength before remove
lectureSchema.pre("remove", function() {
  this.constructor.getSumLength(this.event);
});

module.exports = mongoose.model("Lecture", lectureSchema);
