import mongoose, { Schema } from "mongoose";
import { IServiceRequest } from "@shared/schema";

const ServiceRequestModel = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    serviceType: { type: String, required: true },
    preferredDate: { type: Date, required: true },
    preferredTime: { type: String, required: true },
    location: { type: String, required: true },
    notes: { type: String, required: false },
    status: { type: String, enum: ['pending', 'approved', 'completed', 'canceled'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.ServiceRequest || mongoose.model<IServiceRequest>("ServiceRequest", ServiceRequestModel); 