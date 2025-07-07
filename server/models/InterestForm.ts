import mongoose, { Schema } from 'mongoose';
import { nanoid } from 'nanoid';
import { IProductInterest } from "@shared/schema";

const InterestFormSchema = new Schema({
  formId: { type: String, required: true, unique: true, default: () => `INT-${nanoid()}` },
  productId: { type: Schema.Types.ObjectId, ref: 'MatchmakingProduct', required: true },
  investorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  founderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  messageFromInvestor: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending-admin-review', 'pending-founder-response', 'founder-responded', 'closed-accepted', 'closed-rejected'],
    default: 'pending-admin-review',
  },
  adminReviewed: { type: Boolean, default: false },
  adminToFounderMessage: { type: String }, // Note/edit from admin when forwarding
  founderResponse: { type: String }, // Response from founder
  adminToInvestorMessage: { type: String }, // Final message from admin to investor
  ndaSigned: { type: Boolean, default: false }, // To track the final step
  identitiesRevealed: { type: Boolean, default: false },
  message: { type: String },
  nda: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.InterestForm || mongoose.model<IProductInterest>("InterestForm", InterestFormSchema); 