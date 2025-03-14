const express = require("express");
const roomRoutes = require("./roomsRoutes");
const userRoutes = require("./usersRoutes");
const maintenanceRequestRoute = require("./maintenanceRequestRoutes");
const authRoutes = require("./authroutes");
const authenticateUser = require("../controllers/authenticateUser");
const financialRouter = require("./financialReportRoutes");
const notificationRoutes = require("./notificationRoutes");
const paymentRouter = require("./paymentRoutes");

const router = express.Router();

router.use("/users", authenticateUser, userRoutes);
router.use("/rooms", authenticateUser, roomRoutes);
router.use("/maintenanceRequest", authenticateUser, maintenanceRequestRoute);
router.use("/financial", authenticateUser, financialRouter);
router.use("/notifications", authenticateUser, notificationRoutes);
router.use("/payments", authenticateUser, paymentRouter);

router.use("/auth", authRoutes);

module.exports = router;
