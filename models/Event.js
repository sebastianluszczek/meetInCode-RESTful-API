const mongoose = require("mongoose");
const nodeGeocoder = require("node-geocoder");

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
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true
    },
    address: {
      type: String,
      required: true
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

const options = {
  provider: "opencage",
  httpAdapter: "https",
  apiKey: process.env.GEOCODE_API_KEY,
  formatter: null
};

// Geocoder
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

module.exports = mongoose.model("Event", eventSchema);
