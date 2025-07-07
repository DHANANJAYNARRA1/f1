import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, required: true }, // e.g., 'monitor_deal', 'approve_product', etc.
  targetId: { type: mongoose.Schema.Types.ObjectId }, // e.g., user/product/interest
  status: { type: String, enum: ["pending", "completed", "in_progress"], default: "pending" },
  details: { type: String },
  createdAt: { type: Date, default: Date.now },
  dueDate: { type: Date },
  completedAt: { type: Date }
});

export default mongoose.models.Task || mongoose.model("Task", taskSchema); 