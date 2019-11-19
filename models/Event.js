const mongoose = require("mongoose");
const nodeGeocoder = require("node-geocoder");

//import Lecture model
const Lecture = require("./Lectures");

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add Event name"],
      unique: true
    },
    description: {
      type: String,
      required: [true, "Please add Event description"]
    },
    cost: {
      type: Number,
      required: [true, "Please add Event cost in PLN"]
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    sumLength: {
      type: Number
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true
    },
    avgRating: {
      type: Number
    },
    address: {
      type: String,
      required: [true, "Please add Event address (e.g. Długa 11 Kraków)"]
    },
    participants: {
      type: [
        {
          user: {
            type: mongoose.Schema.ObjectId,
            require: true
          },
          addedAt: {
            type: Date,
            default: Date.now
          }
        }
      ]
    },
    location: {
      // GeoJSON Point
      type: {
        type: String,
        enum: ["Point"]
      },
      coordinates: {
        type: [Number],
        index: "2dsphere"
      },
      streetName: String,
      streetNumber: String,
      city: String,
      state: String,
      zipcode: String,
      country: String,
      countryCode: String
    }
  },
  {
    toJSON: { virtuals: true }
  }
);

eventSchema.virtual("lectures", {
  ref: "Lecture",
  localField: "_id",
  foreignField: "event",
  justOne: false
});

eventSchema.virtual("lecturesCount", {
  ref: "Lecture",
  localField: "_id",
  foreignField: "event",
  count: true
});

// Geocoder
const options = {
  provider: "opencage",
  httpAdapter: "https",
  apiKey: process.env.GEOCODE_API_KEY,
  formatter: null
};

eventSchema.pre("save", async function(next) {
  const loc = await nodeGeocoder(options).geocode(this.address);
  let confidences = [];
  loc.forEach(i => confidences.push(i.extra.confidence));
  const index = confidences.indexOf(Math.max(...confidences));

  this.location = {
    type: "Point",
    coordinates: [loc[index].longitude, loc[index].latitude],
    streetName: loc[index].streetName,
    streetNumber: loc[index].streetNumber,
    city: loc[index].city,
    state: loc[index].state,
    zipcode: loc[index].zipcode,
    country: loc[index].country,
    countryCode: loc[index].countryCode
  };

  this.address = undefined;
  next();
});

// cascade delete of lectures when associated event is deleted
eventSchema.pre("remove", async function(next) {
  await this.model("Lecture").deleteMany({ event: this._id });
  next();
});

module.exports = mongoose.model("Event", eventSchema);
