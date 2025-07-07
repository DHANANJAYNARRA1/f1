import mongoose from "mongoose";
import { nanoid } from 'nanoid';
import { IProduct } from "@shared/schema";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  founderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  founderUniqueId: { type: String, required: true },
  anonymousId: { type: String, required: true },
  productId: { type: String, required: true, unique: true, default: () => nanoid(12) },
  editedByAdmin: { type: Boolean, default: false },
  adminNotes: { type: String, required: false },
  awaitingUserAck: { type: Boolean, default: false },
  acknowledgedByUser: { type: Boolean, default: false },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  category: { type: String, required: true },
  useCase: { type: String, required: true },
  description: { type: String, required: true },
  stage: { type: String, required: true },
  fundingRequired: { type: Number, required: true },
  marketSize: { type: String },
  teamInfo: { type: String },
  financialProjections: { type: String },
  attachments: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Product || mongoose.model<IProduct>("Product", productSchema); 