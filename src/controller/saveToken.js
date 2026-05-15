import express from 'express';
import FCMToken from '../models/FCMToken.js';
const router = express.Router();

router.post("/save-token", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: "Token missing" });
    }

    // Check if token already exists
    const existing = await FCMToken.findOne({ token });
    if (!existing) {
      await FCMToken.create({ token });
    }

    return res.json({
      success: true,
      message: "Token saved successfully",
    });
  } catch (err) {
    console.error("Error saving token:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err });
  }
});

export default router;