const NotificationModel = require("../models/notification");

const createNotification = async (req, res) => {
  try {
    const { recipientRole, recipientId, message } = req.body;

    if (!recipientRole && !recipientId) {
      return res
        .status(400)
        .json({ error: "Either recipientRole or recipientId is required" });
    }
    if (recipientRole && recipientId) {
      return res
        .status(400)
        .json({ error: "Cannot provide both recipientRole and recipientId" });
    }

    const newNotification = new NotificationModel({
      recipientRole,
      recipientId,
      message,
    });

    await newNotification.save();

    res.status(201).json({
      message: "Notification created successfully",
      notification: newNotification,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ error: "Error creating notification" });
  }
};

const getNotifications = async (req, res) => {
  try {
    const { userId, role } = req.params;

    if (req.user.role === "Admin") {
      const allNotifications = await NotificationModel.find().sort({
        createdAt: -1,
      });
      return res.status(200).json(allNotifications);
    }

    const notifications = await NotificationModel.find({
      $or: [{ recipientRole: role }, { recipientId: userId }],
    }).sort({ createdAt: -1 });

    return res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    if (!res.headersSent) {
      return res.status(500).json({ error: "Error fetching notifications" });
    }
  }
};

const markAsRead = async (req, res) => {
  try {
    const notification = await NotificationModel.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res
      .status(200)
      .json({ message: "Notification marked as read", notification });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Error marking notification as read" });
  }
};

const deleteNotification = async (req, res) => {
  try {
    await NotificationModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ error: "Error deleting notification" });
  }
};

const getUnreadNotificationCount = async (req, res) => {
  try {
    const { userId, role } = req.params;

    let count = 0;

    if (req.user.role === "Admin") {
      count = await NotificationModel.countDocuments({ isRead: false });
    } else {
      count = await NotificationModel.countDocuments({
        isRead: false,
        $or: [{ recipientRole: role }, { recipientId: userId }],
      });
    }

    return res.status(200).json({ count });
  } catch (error) {
    console.error("Error fetching unread notification count:", error);
    return res
      .status(500)
      .json({ error: "Error fetching unread notification count" });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  deleteNotification,
  getUnreadNotificationCount,
};
