import mongoose from "mongoose";

const adminActionSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  actionType: { type: String, required: true }, // e.g., "approve", "flag"
  targetId: { type: mongoose.Schema.Types.ObjectId }, // e.g., chat/message/user
  details: { type: String },
  timestamp: { type: Date, default: Date.now },
  notes: { type: String }
}, { timestamps: true });

export default mongoose.models.AdminAction || mongoose.model('AdminAction', adminActionSchema);