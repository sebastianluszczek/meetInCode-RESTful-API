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

// Static method to get sum of length
talkSchema.statics.getSumLength = async function(eventId) {
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
talkSchema.post("save", function() {
  this.constructor.getSumLength(this.event);
});

// Call getSumLength before remove
talkSchema.pre("remove", function() {
  this.constructor.getSumLength(this.event);
});

module.exports = mongoose.model("Talk", talkSchema);
