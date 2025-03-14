const mongoose = require("mongoose");

const RoomsSchema = new mongoose.Schema(
  {
    roomNumber: { type: String, required: true, unique: true },
    floor: { type: Number, required: true },

    type: {
      type: String,
      enum: ["single", "double", "shared"],
      required: true,
    },
    capacity: { type: Number, required: true },
    currentOccupant: {
      residentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      residentName: { type: String, default: null },
      checkInTime: { type: Date, default: null },
      checkOutTime: { type: Date, default: null },
    },

    status: {
      type: String,
      enum: ["Available", "Occupied"],
      required: true,
    },
    price: { type: Number },
    features: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", RoomsSchema);
