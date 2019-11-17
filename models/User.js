const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add name"]
    },
    email: {
      type: String,
      required: [true, "Please add email address"],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email"
      ]
    },
    role: {
      type: String,
      enum: ["user", "lecturer"],
      default: "user"
    },
    password: {
      type: String,
      required: [true, "Please provide password"],
      minlength: [6, "Password should be at least 6 characters long"],
      select: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    toJSON: { virtuals: true }
  }
);

userSchema.virtual("events", {
  ref: "Event",
  localField: "_id",
  foreignField: "user",
  justOne: false
});

userSchema.virtual("lectures", {
  ref: "Lecture",
  localField: "_id",
  foreignField: "user",
  justOne: false
});

userSchema.pre("save", async function(next) {
  const salt = await bcrypt.genSaltSync(10);
  this.password = await bcrypt.hashSync(this.password, salt);
});

module.exports = mongoose.model("User", userSchema);
