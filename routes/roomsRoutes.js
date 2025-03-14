const express = require("express");
const {
  createRoom,
  getRooms,
  updateRoom,
  deleteRoom,
  getRoomById,
  getRoomHistory,
} = require("../controllers/roomsControllers");
const { auth } = require("../middleware/auth");

const roomRoutes = express.Router();

roomRoutes.get("/roomHistory", getRoomHistory);
roomRoutes.get("/", getRooms);
roomRoutes.post("/", createRoom);
roomRoutes.get("/:id", getRoomById);
roomRoutes.put("/:id", updateRoom);
roomRoutes.delete("/:id", deleteRoom);

module.exports = roomRoutes;
