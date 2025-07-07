import mongoose, { Schema, Document } from 'mongoose';

export interface IZoomMeeting extends Document {
  topic: string;
  scheduledFor: Date;
  duration: number; // in minutes
  createdBy: string; // superadmin id
  founderId?: string;
  investorId?: string;
  joinUrl: string;
  startUrl: string;
  zoomMeetingId: string;
  zoomPassword: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  recordingUrl: string;
  transcriptPath: string;
}

const ZoomMeetingSchema = new Schema<IZoomMeeting>({
  topic: { type: String, required: true },
  scheduledFor: { type: Date, required: true },
  duration: { type: Number, required: true },
  createdBy: { type: String, required: true },
  founderId: { type: String },
  investorId: { type: String },
  joinUrl: { type: String, required: true },
  startUrl: { type: String, required: true },
  zoomMeetingId: { type: String, required: true },
  zoomPassword: { type: String, required: true },
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  recordingUrl: { type: String },
  transcriptPath: { type: String },
}, { timestamps: true });

export default mongoose.models.ZoomMeeting || mongoose.model<IZoomMeeting>('ZoomMeeting', ZoomMeetingSchema);

// Example for MongoDB/Drizzle/Prisma: export schema or model as needed 