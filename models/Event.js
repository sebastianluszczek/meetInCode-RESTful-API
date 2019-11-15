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
      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: String
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
  provider: "mapquest",
  httpAdapter: "https",
  apiKey: process.env.MAPQUEST_KEY,
  formatter: null
};

// Geocoder
eventSchema.pre("save", async function(next) {
  const loc = await nodeGeocoder(options).geocode(this.address);
  this.location = {
    type: "Point",
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    streetNumber: loc[0].streetNumber,
    city: loc[0].city,
    state: loc[0].stateCode,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode
  };

  console.log(loc);

  this.address = undefined;
  next();
});

module.exports = mongoose.model("Event", eventSchema);
