import mongoose from "mongoose";

const interestSchema = new mongoose.Schema({
  investorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  primaryIntent: { type: String, required: true },
  investmentAmountRange: { type: String },
  areasOfInterest: [{ type: String }],
  specificQuestions: { type: String },
  timeline: { type: String },
  additionalComments: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Interest", interestSchema); 