const express = require("express");

const {
  userRegister,
  userLogin,
  checkAuth,
  userLogout,
  forgotPassword,
  resetPassword,
} = require("../controllers/userAuth");
const authenticateUser = require("../controllers/authenticateUser");

const authRoutes = express.Router();

authRoutes.post("/register", authenticateUser, userRegister);
authRoutes.post("/login", userLogin);
authRoutes.post("/logout", userLogout);

authRoutes.get("/check-auth", checkAuth);

authRoutes.post("/forgot-password", forgotPassword);
authRoutes.post("/reset-password/:token", resetPassword);

module.exports = authRoutes;
