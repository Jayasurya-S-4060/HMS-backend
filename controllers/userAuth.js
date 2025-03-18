const bcrypt = require("bcryptjs");
const UserModel = require("../models/users");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const userRegister = async (req, res) => {
  try {
    const { name, email, phone, role } = req.body;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    const existingUser = await UserModel.findOne({
      $or: [{ email }, { phone }],
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email or phone number already registered" });
    }

    const randomPassword = crypto.randomBytes(6).toString("hex");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(randomPassword, salt);
    console.log(randomPassword);
    const newUser = new UserModel({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
    });

    await newUser.save();

    await sendEmail(
      email,
      "Your Hostel Account Details",
      `Hello ${name},\n\nYour hostel login password is: ${randomPassword}.\nPlease change your password after logging in.\n\nThank you!`
    );

    res.status(201).json({
      message: "User registered successfully. Password sent via email.",
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    const isPasswordCorrect = bcrypt.compareSync(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate Access Token
    const accessToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // Token valid for 1 hour
    );

    // Store Token in HTTP-Only Cookie
    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    const { password: _, ...userWithoutPassword } = user.toObject();

    res.json({
      message: "Login successful",
      user: userWithoutPassword,
    });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const checkAuth = async (req, res) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No Token Provided" });
    }

    // Verify Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from database
    const user = await UserModel.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ isAuthenticated: true, user });
  } catch (error) {
    res.status(401).json({ message: "Unauthorized - Invalid Token" });
  }
};

const userLogout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    return res.json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Failed to logout", error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Check if an unexpired token already exists
    if (user.resetPasswordToken && user.resetPasswordExpires > Date.now()) {
      return res.json({
        message:
          "A password reset link has already been sent. Please check your email.",
      });
    }

    // Generate a secure token
    const token = crypto.randomBytes(32).toString("hex");

    // Hash token before saving it to the database
    const salt = await bcrypt.genSalt(10);
    user.resetPasswordToken = await bcrypt.hash(token, salt);
    user.resetPasswordExpires = Date.now() + 3600000; // Token valid for 1 hour
    await user.save();

    // Send Email
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    await sendEmail(
      user.email,
      "Password Reset Request",
      `Click on this link to reset your password: ${resetLink}`
    );

    res.json({ message: "Password reset link sent!" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await UserModel.findOne({
      resetPasswordExpires: { $gt: Date.now() }, // Ensure token is still valid
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    // Compare hashed token
    const isTokenValid = await bcrypt.compare(token, user.resetPasswordToken);
    if (!isTokenValid)
      return res.status(400).json({ message: "Invalid or expired token" });

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful!" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  userRegister,
  userLogin,
  checkAuth,
  userLogout,
  forgotPassword,
  resetPassword,
};
