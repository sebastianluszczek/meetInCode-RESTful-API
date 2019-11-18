const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
  rate: {
    type: Number,
    required: [true, "Please add rate value"]
  },
  doc: {
    type: mongoose.Schema.ObjectId,
    required: true
  },
  docType: {
    type: String,
    enum: ["Event", "Lecture"],
    required: true
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

ratingSchema.index({ doc: 1, user: 1 }, { unique: true });

// TODO Posprzątaj tu potem!

// Static method to get average rating
ratingSchema.statics.getAvgRating = async function(docId, docType) {
  const obj = await this.aggregate([
    {
      $match: { doc: docId }
    },
    {
      $group: {
        _id: `$${docType.toLowerCase()}`,
        avgRating: { $avg: "$rate" }
      }
    }
  ]);

  try {
    await this.model(docType).findByIdAndUpdate(docId, {
      avgRating: obj[0].avgRating
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getSumLength after save
ratingSchema.post("save", function() {
  this.constructor.getAvgRating(this.doc, this.docType);
});

// Call getSumLength before remove
ratingSchema.pre("remove", function() {
  this.constructor.getAvgRating(this.doc, this.docType);
});

module.exports = mongoose.model("Rating", ratingSchema);
