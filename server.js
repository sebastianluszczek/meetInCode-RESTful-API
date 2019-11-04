const express = require("express");
const mongoose = require("mongoose");
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
const talkRouter = require("./routes/talks");

const app = express();

// json parse middleware
app.use(express.json());

// use routes
app.use("/api/events", eventRouter);
app.use("/api/talks", talkRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}...`));
