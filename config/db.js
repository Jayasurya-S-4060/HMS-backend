const mongoose = require("mongoose");
require("dotenv").config();

let URL = process.env.Mongo_URI;

const connectDb = async () => {
  await mongoose
    .connect(URL)
    .then(() => {
      console.log("mongose connected");
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err);
      process.exit(1);
    });
};

module.exports = connectDb;
