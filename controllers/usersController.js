const UserModel = require("../models/users");
const RoomModel = require("../models/rooms");

// const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

// const createUser = async (req, res) => {
//   try {
//     const { name, email, phone, role } = req.body;

//     const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
//     if (!emailRegex.test(email)) {
//       return res.status(400).json({ message: "Invalid email format" });
//     }

//     const phoneRegex = /^[6-9]\d{9}$/;
//     if (!phoneRegex.test(phone)) {
//       return res.status(400).json({ message: "Invalid phone number" });
//     }

//     const existingUser = await UserModel.findOne({
//       $or: [{ email }, { phone }],
//     });
//     if (existingUser) {
//       return res
//         .status(400)
//         .json({ message: "Email or phone number already registered" });
//     }

//     const randomPassword = crypto.randomBytes(6).toString("hex");
//     // const hashedPassword = await bcrypt.hash(randomPassword, 10);

//     const newUser = new UserModel({
//       name,
//       email,
//       password: randomPassword,
//       // password: hashedPassword,
//       phone,
//       role,
//     });

//     await newUser.save();

//     await sendEmail(
//       email,
//       "Your Hostel Account Details",
//       `Hello ${name},\n\nYour hostel login password is: ${randomPassword}.\nPlease change your password after logging in.\n\nThank you!`
//     );

//     res.status(201).json({
//       message: "User registered successfully. Password sent via email.",
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server Error", error: error.message });
//   }
// };

const getUsers = async (req, res) => {
  try {
    const { type } = req.query;
    const validRoles = ["Resident", "Staff"];

    let query = {};

    if (type) {
      if (!validRoles.includes(type)) {
        return res.status(400).json({ message: "Invalid role type" });
      }
      query.role = type;
    } else {
      query.role = { $ne: "Admin" };
    }

    const allUsers = await UserModel.find(query)
      .select("-password")
      .populate("roomId"); // Populate room details

    if (!allUsers.length) {
      return res.status(404).json({ message: "No users found" });
    }

    res.status(200).json(allUsers);
  } catch (error) {
    res.status(500).json({
      message: "Error while fetching users",
      error: error.message,
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params; // Get user ID from request parameters

    // Find the user by ID
    const user = await UserModel.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch room details if the user has a roomId
    let roomDetails = null;
    if (user.role === "Resident" && user.roomId) {
      roomDetails = await RoomModel.findById(user.roomId);
    }

    // Send the user data along with room details (if applicable)
    res.status(200).json({ ...user.toObject(), room: roomDetails });
  } catch (error) {
    res.status(500).json({
      message: "Error while fetching user",
      error: error.message,
    });
  }
};

const updateUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const updatedUser = await UserModel.findByIdAndUpdate(id, updateData, {
      new: true, // Returns updated user
      runValidators: true, // Ensures validation rules apply
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error while updating user", error: error.message });
  }
};

module.exports = { getUsers, getUserById, updateUserById };
