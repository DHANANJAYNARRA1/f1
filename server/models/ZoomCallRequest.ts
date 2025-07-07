import mongoose, { Schema } from "mongoose";
import { IZoomCallRequest } from "@shared/schema";

const zoomCallRequestSchema = new Schema({
    requester: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: String, required: true },
  message: { type: String, required: true },
  proposedDate: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'scheduled', 'completed'], default: 'pending' },
  adminNotes: { type: String },
  scheduledMeetingId: { type: Schema.Types.ObjectId, ref: 'ZoomMeeting' },
}, { timestamps: true });

export default mongoose.models.ZoomCallRequest || mongoose.model<IZoomCallRequest>('ZoomCallRequest', zoomCallRequestSchema); 