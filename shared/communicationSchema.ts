import { z } from "zod";
import mongoose, { Document, Schema } from "mongoose";

// Define the communication request schema for MongoDB
export const communicationRequestSchema = new Schema({
  requesterId: {
    type: String,
    required: true,
  },
  requesterName: {
    type: String,
    required: true,
  },
  targetId: {
    type: String,
    required: true,
  },
  targetName: {
    type: String,
    required: true,
  },
  targetType: {
    type: String,
    enum: ["founder", "investor"],
    required: true,
  },
  requestType: {
    type: String,
    enum: ["meeting", "call", "message"],
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "completed"],
    default: "pending",
  },
  date: {
    type: Date,
    required: false,
  },
  time: {
    type: String,
    required: false,
  },
  ndaAgreed: {
    type: Boolean,
    default: false,
  },
  zoomMeetingUrl: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Define the TypeScript interface for the document
export interface ICommunicationRequest extends Document {
  requesterId: string;
  requesterName: string;
  targetId: string;
  targetName: string;
  targetType: "founder" | "investor";
  requestType: "meeting" | "call" | "message";
  subject: string;
  message: string;
  status: "pending" | "approved" | "rejected" | "completed";
  date?: Date;
  time?: string;
  ndaAgreed: boolean;
  zoomMeetingUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define the Zod schema for inserting a new communication request
export const insertCommunicationRequestSchema = z.object({
  targetUserId: z.string(),
  targetName: z.string(),
  targetType: z.enum(["founder", "investor"]),
  requestType: z.enum(["meeting", "call", "message"]),
  subject: z.string().min(3),
  message: z.string().min(10),
  date: z.string().optional(),
  time: z.string().optional(),
  ndaAgreed: z.boolean().refine(val => val === true, {
    message: "NDA terms must be agreed to",
  }),
});

// Create the model
export const CommunicationRequest = mongoose.models.CommunicationRequest || 
  mongoose.model<ICommunicationRequest>("CommunicationRequest", communicationRequestSchema);

// Define types
export type InsertCommunicationRequest = z.infer<typeof insertCommunicationRequestSchema>;
export type CommunicationRequestType = ICommunicationRequest;