import mongoose from "mongoose";
import { nanoid } from 'nanoid';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["superadmin", "admin", "founder", "investor", "organization", "mentor", "other"], required: true },
  userType: { type: String, enum: ["founder", "investor", "organization", "mentor", "admin", "superadmin", "other"], required: true },
  uniqueId: { type: String, required: true, unique: true }, // Always required and generated
  anonymousId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  isVerified: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  permissions: [{ type: String }], // e.g., ['monitor_deals', 'approve_products']
  assignedTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  createdAt: { type: Date, default: Date.now },
  // Founder approval and document verification fields:
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  documents: {
    type: Object,
    default: {
      idDocument: '',
      businessDocument: '',
      pitchDeck: '',
      certificationOfIncorporation: '',
      companyOverview: '',
      memorandumOfAssociation: '',
      businessPlan: '',
      financialModel: '',
      intellectualProperty: '',
      executiveSummary: '',
      marketAnalysis: '',
      productRoadmap: '',
      useOfInvestments: ''
    }
  },
  documentsMeta: {
    type: Object,
    default: {
      idDocument: { status: 'pending', url: '', reviewedBy: '', reviewedAt: null, rejectionReason: '' },
      businessDocument: { status: 'pending', url: '', reviewedBy: '', reviewedAt: null, rejectionReason: '' },
      pitchDeck: { status: 'pending', url: '', reviewedBy: '', reviewedAt: null, rejectionReason: '' },
      certificationOfIncorporation: { status: 'pending', url: '', reviewedBy: '', reviewedAt: null, rejectionReason: '' },
      companyOverview: { status: 'pending', url: '', reviewedBy: '', reviewedAt: null, rejectionReason: '' },
      memorandumOfAssociation: { status: 'pending', url: '', reviewedBy: '', reviewedAt: null, rejectionReason: '' },
      businessPlan: { status: 'pending', url: '', reviewedBy: '', reviewedAt: null, rejectionReason: '' },
      financialModel: { status: 'pending', url: '', reviewedBy: '', reviewedAt: null, rejectionReason: '' },
      intellectualProperty: { status: 'pending', url: '', reviewedBy: '', reviewedAt: null, rejectionReason: '' },
      executiveSummary: { status: 'pending', url: '', reviewedBy: '', reviewedAt: null, rejectionReason: '' },
      marketAnalysis: { status: 'pending', url: '', reviewedBy: '', reviewedAt: null, rejectionReason: '' },
      productRoadmap: { status: 'pending', url: '', reviewedBy: '', reviewedAt: null, rejectionReason: '' },
      useOfInvestments: { status: 'pending', url: '', reviewedBy: '', reviewedAt: null, rejectionReason: '' },
    }
  }
});

export default mongoose.models.User || mongoose.model("User", userSchema);