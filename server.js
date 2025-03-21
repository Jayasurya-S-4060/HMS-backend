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
    origin: [process.env.FRONTEND_URL, "http://localhost:5174"],
    credentials: true, // Allows cookies to be sent
  })
);
app.use("/api", router);

app.listen(port, () => {
  console.log("connected");
});
