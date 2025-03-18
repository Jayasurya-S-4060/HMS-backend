const UserModel = require("../models/users");
const RoomModel = require("../models/rooms");

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
