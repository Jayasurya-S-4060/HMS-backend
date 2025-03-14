const mongoose = require("mongoose");

const roomHistorySchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    roomNumber: {
      type: String,
      required: true,
    },
    residentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resident",
      required: true,
    },
    residentName: {
      type: String,
      required: true,
    },
    checkInTime: {
      type: Date,
      required: true,
    },
    checkOutTime: {
      type: Date,
      required: true,
    },

    paymentIntentId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const RoomHistoryModel = mongoose.model("RoomHistory", roomHistorySchema);

module.exports = RoomHistoryModel;
