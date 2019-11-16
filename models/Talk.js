const mongoose = require("mongoose");

const talkSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add Talk name"]
  },
  description: {
    type: String,
    required: [true, "Please add Talk description"]
  },
  length: {
    type: Number,
    required: [true, "Please add Talk length in hours"]
  },
  event: {
    type: mongoose.Schema.ObjectId,
    ref: "Event",
    required: [
      true,
      "You have to provide Event id this Talk is associated with"
    ]
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
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

// Call getSumLength after update
talkSchema.post("findByIdAndUpdate", function() {
  console.log("fire");
  this.constructor.getSumLength(this.event);
});

// Call getSumLength before remove
talkSchema.pre("remove", function() {
  this.constructor.getSumLength(this.event);
});

module.exports = mongoose.model("Talk", talkSchema);
