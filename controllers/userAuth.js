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
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
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
    const token = req.cookies?.token; // Get token from cookies

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

module.exports = { userRegister, userLogin, checkAuth, userLogout };
