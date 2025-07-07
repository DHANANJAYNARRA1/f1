import express from "express";
import Message from "../models/Message";
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Send message
router.post("/", requireAuth, async (req, res) => {
  const { to, content } = req.body;
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized: user not found" });
  }
  const from = req.user._id;
  const message = await Message.create({ from, to, content });
  res.json({ success: true, message });
});

// Get messages for user
router.get("/", requireAuth, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized: user not found" });
  }
  const userId = req.user._id;
  const messages = await Message.find({ to: userId }).populate("from", "name userType");
  res.json({ success: true, messages });
});

export default router;