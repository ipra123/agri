import prisma from "../lib/prisma.js";

export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: req.params.id },
      data: {
        status: "SENT",
        sentAt: new Date(),
      },
    });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    const result = await prisma.notification.updateMany({
      where: { userId: req.user.id, status: "PENDING" },
      data: {
        status: "SENT",
        sentAt: new Date(),
      },
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
