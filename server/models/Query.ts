import mongoose, { Schema } from 'mongoose';

const QuerySchema = new Schema({
    // Basic info
    userId: { type: String, required: true }, // Can be founder, investor, etc.
    userName: { type: String, required: true },
    userType: { type: String, required: true },
    
    // Query details
    subject: { type: String, required: true },
    message: { type: String, required: true },
    category: { 
        type: String, 
        enum: ['general', 'technical', 'billing', 'partnership', 'feedback'], 
        default: 'general' 
    },
    priority: { 
        type: String, 
        enum: ['low', 'medium', 'high', 'urgent'], 
        default: 'medium' 
    },
    
    // Status and assignment
    status: {
        type: String,
        enum: ['new', 'open', 'in-progress', 'resolved', 'closed', 'reopened'], 
        default: 'new' 
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', default: null },

    // Resolution details
    resolution: { type: String, default: null },
    closedAt: { type: Date, default: null },
    
    // Attachments
    attachments: [{
        fileName: String,
        filePath: String,
        fileType: String
    }],
    
    // Communication history
    history: [{
        adminId: { type: String },
        action: String,
        notes: String,
        timestamp: { type: Date, default: Date.now }
    }],
}, { timestamps: true });


QuerySchema.pre('save', function(next) {
    if (this.isNew) {
        console.log(`New query submitted by ${this.userName}.`);
    }
    next();
});

export default mongoose.models.Query || mongoose.model('Query', QuerySchema); 