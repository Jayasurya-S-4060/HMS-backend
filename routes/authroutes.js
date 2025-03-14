const express = require("express");

const {
  userRegister,
  userLogin,
  checkAuth,
  userLogout,
} = require("../controllers/userAuth");
const authenticateUser = require("../controllers/authenticateUser");

const authRotues = express.Router();

authRotues.post("/register", authenticateUser, userRegister);
authRotues.post("/login", userLogin);
authRotues.post("/logout", userLogout);

authRotues.get("/check-auth", checkAuth);

// router.post("/reset-password", auth, resetPassword);
// router.post("/reset-password-request", auth, resetPasswordRequest);
// router.get("/user", auth, getUserInfo);

module.exports = authRotues;
