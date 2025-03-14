const express = require("express");
const {
  createNotification,
  getNotifications,
  markAsRead,
  deleteNotification,
  getUnreadNotificationCount,
} = require("../controllers/notificationController");

const router = express.Router();

router.post("/", createNotification);

router.get("/:userId/:role", getNotifications);

router.put("/:id/read", markAsRead);

router.delete("/:id", deleteNotification);

router.get("/count/:userId/:role", getUnreadNotificationCount);

module.exports = router;
