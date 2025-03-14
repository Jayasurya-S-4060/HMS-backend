const express = require("express");
const { auth } = require("../middleware/auth");
const {
  createUser,
  getUsers,
  getUserById,
  updateUserById,
} = require("../controllers/usersController");

const userRoutes = express.Router();

// userRoutes.post("/register", auth, createUser);
userRoutes.get("/", getUsers);
userRoutes.get("/:id", getUserById);
userRoutes.put("/:id", updateUserById);

module.exports = userRoutes;
