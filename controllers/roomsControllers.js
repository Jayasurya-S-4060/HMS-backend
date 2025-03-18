const RoomsModel = require("../models/rooms");
const UserModel = require("../models/users");
const RoomHistoryModel = require("../models/roomHistroy");

const createRoom = async (req, res) => {
  try {
    const { roomNumber, floor, type, capacity, status, price, features } =
      req.body;

    const newRoom = new RoomsModel({
      roomNumber,
      floor,
      type,
      capacity,
      status,
      price,
      features,
      currentOccupant: {
        residentId: null,
        residentName: null,
        checkInTime: null,
        checkOutTime: null,
      },
    });

    await newRoom.save();
    return res.status(201).json({ message: "Successfully created room" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error while creating room", error: err.message });
  }
};

const getRooms = async (req, res) => {
  try {
    const rooms = await RoomsModel.find();
    res.status(200).json(rooms);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error while fetching rooms", error: err.message });
  }
};

const getRoomById = async (req, res) => {
  try {
    const room = await RoomsModel.findById(req.params.id);
    if (room) {
      res.status(200).json(room);
    } else {
      res.status(404).json({ message: "Room not found" });
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error while fetching room", error: err.message });
  }
};

const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await RoomsModel.findByIdAndDelete(id);
    if (room) {
      res.status(200).json({ message: "Successfully deleted" });
    } else {
      res.status(404).json({ message: "Room not found" });
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error while deleting room", error: err.message });
  }
};

const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, currentOccupant } = req.body;

    const room = await RoomsModel.findById(id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (status === "Occupied" && currentOccupant) {
      room.status = "Occupied";
      room.currentOccupant = {
        residentId: currentOccupant.residentId,
        residentName: currentOccupant.residentName,
        checkInTime: new Date(),
        checkOutTime: null,
      };

      await UserModel.findByIdAndUpdate(currentOccupant.residentId, {
        roomId: room._id,
      });
    }

    if (room.status === "Occupied" && status === "Available") {
      const checkOutTime = new Date();

      const roomHistory = new RoomHistoryModel({
        roomId: room._id,
        roomNumber: room.roomNumber,
        residentId: room.currentOccupant.residentId,
        residentName: room.currentOccupant.residentName,
        checkInTime: room.currentOccupant.checkInTime,
        checkOutTime: checkOutTime,
      });

      await roomHistory.save();

      room.status = "Available";
      room.currentOccupant = {
        residentId: null,
        residentName: null,
        checkInTime: null,
        checkOutTime: null,
      };

      await UserModel.findByIdAndUpdate(room.currentOccupant.residentId, {
        roomId: null,
      });
    }

    const updatedRoom = await room.save();

    res
      .status(200)
      .json({ message: "Successfully updated", room: updatedRoom });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error while updating room", error: err.message });
  }
};

const getRoomHistory = async (req, res) => {
  try {
    const roomHistory = await RoomHistoryModel.find();
    res.status(200).json(roomHistory);
  } catch (error) {
    res.status(500).json({ message: "Error fetching room history", error });
  }
};

module.exports = {
  createRoom,
  getRooms,
  updateRoom,
  deleteRoom,
  getRoomById,
  getRoomHistory,
};
