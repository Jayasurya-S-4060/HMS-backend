const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["Resident", "Staff"],
    required: true,
  },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", default: null },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
});

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
