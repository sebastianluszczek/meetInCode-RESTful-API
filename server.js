const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
require("dotenv").config();

// connect mongoDB
mongoose.connect(
  process.env.DB_CONNECT,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  },
  () => console.log("Connected to MongoDB...")
);

// import routes
const eventRouter = require("./routes/events");
const talkRouter = require("./routes/lectures");
const authRouter = require("./routes/auth");
const userRouter = require("./routes/users");
const ratingRouter = require("./routes/ratings");

const app = express();

// json parse middleware
app.use(express.json());

// static folder
app.use(express.static("public"));

// logging middleware - morgan
app.use(morgan("tiny"));

// use routes
app.use("/api/events", eventRouter);
app.use("/api/lectures", talkRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/ratings", ratingRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}...`));
