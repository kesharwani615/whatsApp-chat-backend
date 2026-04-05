// server/routes/notifications.js
import express from 'express';
const router = express.Router();
import { sendToDevice } from '../services/sendNotification.js';

router.post("/send-notification", async (req, res) => {
  try {
    const { token, notification, data } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    const response = await sendToDevice(token, {
      title: notification?.title || "Default title",
      body: notification?.body || "Default body",
      data,
    });

    return res.json({ success: true, response });
  } catch (err) {
    console.log("Notification error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
