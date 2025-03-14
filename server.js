const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const router = require("./routes");
const cookieParser = require("cookie-parser");

require("dotenv").config();
const port = process.env.PORT || 3000;

const app = express();

connectDB();

app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173", // Update with your frontend URL
    credentials: true, // Allows cookies to be sent
  })
);
app.use("/api", router);

app.listen(port, () => {
  console.log("connected");
});
