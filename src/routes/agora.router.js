import express from "express";
import { generateToken } from "../config/agora.js";
import { ProtectMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/token", ProtectMiddleware, (req, res) => {
    const { receiverId, channelName } = req.query;
    const loggedInUserId = req.user._id;

    if (!receiverId) {
        return res.status(400).json({ error: "Receiver ID is required" });
    }

    if (!channelName) {
        return res.status(400).json({ error: "Channel Name is required" });
    }

    const data = generateToken(loggedInUserId, channelName);

    res.json(data);
});

export default router;