import prisma from "../lib/prisma.js";
import { sendEmail } from "../lib/sendEmails.js";

// User fetches their own chat history with Admin
export const getUserChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      orderBy: { createdAt: "asc" }
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin fetches list of all chat users (WhatsApp-style list)
export const getChatUsers = async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      orderBy: { createdAt: "desc" }
    });

    const userIds = new Set();
    messages.forEach((msg) => {
      if (msg.senderRole === "FARMER" || msg.senderRole === "SUPPLIER") {
        userIds.add(msg.senderId);
      } else {
        userIds.add(msg.receiverId);
      }
    });

    const uniqueUserIds = Array.from(userIds);

    const users = await prisma.user.findMany({
      where: { id: { in: uniqueUserIds } },
      select: { id: true, name: true, email: true }
    });

    // Map users with their latest message
    const chatUsers = users.map((user) => {
      // Find latest message for this user
      const userMsg = messages.find(
        (m) => ((m.senderId === user.id && ["FARMER", "SUPPLIER"].includes(m.senderRole)) || (m.receiverId === user.id && m.senderRole === "ADMIN"))
      );
      return {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        lastMessage: userMsg ? userMsg.content : "",
        lastMessageTime: userMsg ? userMsg.createdAt : null,
        lastMessageSenderRole: userMsg ? userMsg.senderRole : null,
        lastMessageSenderName: userMsg ? userMsg.senderName : null,
      };
    });

    // Sort by last message time descending
    chatUsers.sort((a, b) => {
      if (!a.lastMessageTime) return 1;
      if (!b.lastMessageTime) return -1;
      return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
    });

    res.json(chatUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin fetches chat history for a specific user
export const getAdminChatHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      orderBy: { createdAt: "asc" }
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin sends an email to user, and it logs into the chat history
export const sendAdminEmail = async (req, res) => {
  try {
    const { userId, subject, content } = req.body;
    const adminId = req.user.id;
    const adminName = req.user.name;

    if (!userId || !subject || !content) {
      return res.status(400).json({ message: "userId, subject, and content are required" });
    }

    // 1. Fetch recipient user details
    const recipient = await prisma.user.findUnique({ where: { id: userId } });
    if (!recipient) {
      return res.status(404).json({ message: "Recipient user not found" });
    }

    // 2. Dispatch email using nodemailer
    await sendEmail({
      to: recipient.email,
      subject,
      text: content,
    });

    // 3. Save logs as a message history record
    const emailMessageText = `[EMAIL SENT] Subject: ${subject}\n\n${content}`;
    const message = await prisma.message.create({
      data: {
        senderId: adminId,
        senderName: adminName,
        senderRole: "ADMIN",
        receiverId: userId,
        content: emailMessageText,
      },
    });

    // 4. Synchronize user and admin UI streams
    const io = req.app.get("io");
    if (io) {
      io.to(userId).emit("receive-message", message);
      io.to("admins").emit("receive-message", message);
    }

    res.json({ success: true, message });
  } catch (error) {
    console.error("Error sending admin email:", error);
    res.status(500).json({ message: error.message || "Failed to dispatch email" });
  }
};
