const express = require("express");
const {
  createMaintenanceRequest,
  getMaintenanceRequests,
  editMaintenanceRequest,
} = require("../controllers/maintenanceController");
const { auth } = require("../middleware/auth");

const maintenanceRequestRoute = express.Router();

maintenanceRequestRoute.post("/", createMaintenanceRequest);
maintenanceRequestRoute.get("/", getMaintenanceRequests);
maintenanceRequestRoute.put("/:id", editMaintenanceRequest);

// maintenanceRequestRoute.get("/:id", auth, createMaintenanceRequest);

module.exports = maintenanceRequestRoute;
