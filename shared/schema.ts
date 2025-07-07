import { z } from "zod";
import mongoose, { Document, Schema } from "mongoose";

// User schema definition (MongoDB/Mongoose)
export const userSchema = new Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  passwordHash: { type: String, required: false },
  role: { type: String, enum: ["superadmin", "admin", "founder", "investor", "organization", "mentor", "other"], required: false },
  isAdmin: { type: Boolean, default: false },
  userType: { type: String, enum: ['founder', 'investor', 'organization', 'mentor', 'admin', 'superadmin', 'other'], default: 'other' },
  uniqueId: { type: String, required: false, unique: true, sparse: true },
  otherTypeDesc: { type: String, required: false },
  phone: { type: String, required: false },
  profession: { type: String, required: false },
  interests: { type: String, required: false },
  organization: { type: String, required: false },
  alias: { type: String, required: false },
  permissions: [{ type: String }],
  assignedTasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
  passwordResetOTP: { type: String, required: false },
  passwordResetExpiry: { type: Date, required: false },
  createdAt: { type: Date, default: Date.now },
  
  // Founder specific fields
  companyName: { type: String, required: false },
  legalName: { type: String, required: false },
  companyRegistrationNumber: { type: String, required: false },
  address: { type: String, required: false },
  verificationStatus: { 
    type: String, 
    enum: ['not_submitted', 'pending_verification', 'approved', 'rejected'], 
    default: 'not_submitted' 
  },
  
  // Document paths for founders
  documents: {
    id: { type: String },
    business: { type: String },
  },
  documentsMeta: {
    id: { status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' } },
    business: { status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' } },
  },
});

// Product interest schema definition
export const productInterestSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  productId: { type: String, required: true },
  source: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

// Service request schema definition
export const serviceRequestSchema = new Schema({
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

// Product schema definition
export const productSchema = new Schema({
  name: { type: String, required: true },
  fullName: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: String, required: true },
  regulatoryCompliance: { type: String, required: false },
  certification: { type: String, required: false },
  pilotStudy: { type: String, required: false },
  research: { type: String, required: false },
  businessModel: { type: String, required: true },
  image: { type: String, required: false },
  tags: [{ name: String }],
  benefits: [String],
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  interestCount: { type: Number, default: 0 },
  pitchDeck: { type: String, required: false },
  documents: { type: Schema.Types.Mixed, required: false },
});

// Model interfaces
export interface IUser extends Document {
  name: string;
  username: string;
  password: string;
  passwordHash?: string;
  role: 'superadmin' | 'admin' | 'founder' | 'investor' | 'organization' | 'mentor' | 'other';
  isAdmin: boolean;
  userType: 'founder' | 'investor' | 'organization' | 'mentor' | 'admin' | 'superadmin' | 'other';
  uniqueId?: string; // FOB/INV/ORG number, optional for admin/other
  otherTypeDesc?: string;
  phone?: string;
  profession?: string;
  interests?: string;
  organization?: string;
  alias?: string;
  permissions?: string[];
  assignedTasks?: mongoose.Types.ObjectId[];
  createdAt: Date;
  email?: string;
  passwordResetOTP?: string;
  passwordResetExpiry?: Date;
  
  // Founder specific fields
  companyName?: string;
  legalName?: string;
  companyRegistrationNumber?: string;
  address?: string;
  verificationStatus?: 'not_submitted' | 'pending_verification' | 'approved' | 'rejected';
  
  // Document paths for founders
  documents?: {
    id?: string;
    business?: string;
    [key: string]: string | undefined;
  };
  documentsMeta?: {
    [key: string]: {
      status: 'pending' | 'approved' | 'rejected';
      url?: string;
      reviewedBy?: string;
      reviewedAt?: string | null;
      rejectionReason?: string;
    };
  };
  status?: 'pending' | 'approved' | 'rejected';
}

export interface IProductInterest extends Document {
  userId: mongoose.Types.ObjectId | string;
  userName: string;
  productId: string;
  source?: string | null;
  createdAt: Date;
}

export interface IServiceRequest extends Document {
  userId: mongoose.Types.ObjectId | string;
  userName: string;
  serviceType: string;
  preferredDate: Date;
  preferredTime: string;
  location: string;
  notes?: string;
  status: 'pending' | 'approved' | 'completed' | 'canceled';
  createdAt: Date;
}

export interface IProduct extends Document {
  name: string;
  fullName: string;
  description: string;
  category: string;
  price: string;
  regulatoryCompliance?: string;
  certification?: string;
  pilotStudy?: string;
  research?: string;
  businessModel: string;
  image?: string;
  tags: { name: string }[];
  benefits: string[];
  userId: mongoose.Types.ObjectId | string;
  userName: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  productId?: string;
  founderUniqueId?: string;
  editedByAdmin?: boolean;
  adminNotes?: string;
  awaitingUserAck?: boolean;
  acknowledgedByUser?: boolean;
  interestCount: number;
  pitchDeck?: string;
  documents?: { [key: string]: string };
}

export interface IZoomCallRequest extends Document {
  requester: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  topic: string;
  message: string;
  proposedDate: Date;
  status: 'pending' | 'approved' | 'rejected' | 'scheduled' | 'completed';
  adminNotes?: string;
  scheduledMeetingId?: mongoose.Types.ObjectId;
}

// Zod schemas for validation
export const insertUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  isAdmin: z.boolean().optional().default(false),
  userType: z.enum(['founder', 'investor', 'organization', 'mentor', 'other']).optional().default('other'),
  otherTypeDesc: z.string().optional(),
  phone: z.string().optional(),
  profession: z.string().optional(),
  interests: z.string().optional(),

  // Founder specific fields
  companyName: z.string().optional(),
  legalName: z.string().optional(),
  companyRegistrationNumber: z.string().optional(),
  address: z.string().optional(),
});

export const insertProductInterestSchema = z.object({
  userId: z.string(),
  userName: z.string(),
  productId: z.string(),
  source: z.string().nullable().optional()
});

export const insertServiceRequestSchema = z.object({
  userId: z.string(),
  userName: z.string(),
  serviceType: z.string(),
  preferredDate: z.string().or(z.date()),
  preferredTime: z.string(),
  location: z.string(),
  notes: z.string().optional(),
  status: z.enum(['pending', 'approved', 'completed', 'canceled']).optional().default('pending')
});

export const insertProductSchema = z.object({
  name: z.string().min(2).max(50),
  fullName: z.string().min(2).max(100),
  description: z.string().min(50).max(500),
  category: z.enum(["AgriTech", "HealthTech", "FinTech", "MedTech", "EduTech"]),
  price: z.string().min(1),
  regulatoryCompliance: z.string().optional(),
  certification: z.string().optional(),
  pilotStudy: z.string().optional(),
  research: z.string().optional(),
  businessModel: z.enum(["B2B", "B2C", "B2B2C"]),
  image: z.string().optional(),
  tags: z.array(z.object({ name: z.string() })),
  benefits: z.array(z.string()),
  userId: z.string(),
  userName: z.string(),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
});

export const founderOnboardingSchema = z.object({
  idDocument: z.any().refine(file => file?.length == 1, 'ID Document is required.'),
  businessDocument: z.any().refine(file => file?.length == 1, 'Business Document is required.'),
  // userId is needed to associate the documents with the user
  userId: z.string(),
});

export const userTypeFormSchema = z.object({
  userType: z.enum(["founder", "investor", "organization", "mentor", "other"]),
  // Conditional fields based on user type
  // For founders
  companyName: z.string().optional(),
  industry: z.string().optional(),
  stage: z.string().optional(),
  fundingNeeded: z.string().optional(),
  
  // For investors
  investorType: z.string().optional(),
  investmentFocusIndustry: z.string().optional(),
  investmentFocusStage: z.string().optional(),
  investmentRange: z.string().optional(),
  investmentTimeline: z.string().optional(),
  preferredIndustries: z.string().optional(),
  
  // For organizations
  organizationType: z.string().optional(),
  employeeCount: z.string().optional(),
  
  // For others
  profession: z.string().optional(),
  interests: z.string().optional(),
  
  otherTypeDesc: z.string().optional(),
  
  // Common fields that must be part of the main registration
  name: z.string().min(1, 'Name is required'),
  username: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  bio: z.string().optional().nullable(),
});

export type IUserTypeForm = z.infer<typeof userTypeFormSchema>;

// Safe model creation - only on server side
export const User = (() => {
  if (typeof window !== 'undefined') return undefined;
  try {
    return mongoose.models?.User || mongoose.model<IUser>("User", userSchema);
  } catch {
    return undefined;
  }
})();

export const ProductInterest = (() => {
  if (typeof window !== 'undefined') return undefined;
  try {
    return mongoose.models?.ProductInterest || mongoose.model<IProductInterest>("ProductInterest", productInterestSchema);
  } catch {
    return undefined;
  }
})();

export const ServiceRequest = (() => {
  if (typeof window !== 'undefined') return undefined;
  try {
    return mongoose.models?.ServiceRequest || mongoose.model<IServiceRequest>("ServiceRequest", serviceRequestSchema);
  } catch {
    return undefined;
  }
})();

export const Product = (() => {
  if (typeof window !== 'undefined') return undefined;
  try {
    return mongoose.models?.Product || mongoose.model<IProduct>("Product", productSchema);
  } catch {
    return undefined;
  }
})();

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = IUser;

export type InsertProductInterest = z.infer<typeof insertProductInterestSchema>;
export type ProductInterest = IProductInterest;

export type InsertServiceRequest = z.infer<typeof insertServiceRequestSchema>;
export type ServiceRequest = IServiceRequest;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = IProduct;
