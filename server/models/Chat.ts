import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }]
}, { timestamps: true });

export default mongoose.models.Chat || mongoose.model('Chat', chatSchema);