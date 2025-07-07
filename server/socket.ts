import { Server } from "socket.io";
import type { Server as HTTPServer } from "http";
import mongoose, { Document, Model, Schema } from "mongoose";

// Define interfaces matching your schema
interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  senderId: string;
  receiverId: string;
  senderAlias: string;
  receiverAlias: string;
  content: string;
  isAnonymous: boolean;
  timestamp: Date;
  ndaSigned: boolean;
  paymentStatus: 'pending' | 'paid' | 'unlocked';
  zoomRequested: boolean;
  zoomLink?: string;
  adminApproved: boolean;
  messageType?: 'text' | 'file' | 'image';
  isRead?: boolean;
}

interface IConversation extends Document {
  participants: string[];
  aliases: Map<string, string>;
  ndaSigned: boolean;
  paymentStatus: 'pending' | 'paid' | 'unlocked';
  zoomRequested: boolean;
  zoomLink?: string;
  adminApproved: boolean;
  createdAt: Date;
  lastActivity: Date;
  isActive: boolean;
}

// Enhanced schemas with better validation
const messageSchema = new Schema<IMessage>({
  conversationId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Conversation', 
    required: [true, 'Conversation ID is required'] 
  },
  senderId: { 
    type: String, 
    required: [true, 'Sender ID is required'],
    trim: true 
  },
  receiverId: { 
    type: String, 
    required: [true, 'Receiver ID is required'],
    trim: true 
  },
  senderAlias: { 
    type: String, 
    required: [true, 'Sender alias is required'],
    trim: true,
    maxlength: [50, 'Sender alias cannot exceed 50 characters']
  },
  receiverAlias: { 
    type: String, 
    required: [true, 'Receiver alias is required'],
    trim: true,
    maxlength: [50, 'Receiver alias cannot exceed 50 characters']
  },
  content: { 
    type: String, 
    required: [true, 'Message content is required'],
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  isAnonymous: { type: Boolean, default: true },
  timestamp: { type: Date, default: Date.now },
  ndaSigned: { type: Boolean, default: false },
  paymentStatus: { 
    type: String, 
    enum: {
      values: ['pending', 'paid', 'unlocked'],
      message: 'Payment status must be pending, paid, or unlocked'
    },
    default: 'pending' 
  },
  zoomRequested: { type: Boolean, default: false },
  zoomLink: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^https:\/\/zoom\.us\//.test(v);
      },
      message: 'Invalid Zoom link format'
    }
  },
  adminApproved: { type: Boolean, default: false },
  messageType: { 
    type: String, 
    enum: ['text', 'file', 'image'], 
    default: 'text' 
  },
  isRead: { type: Boolean, default: false }
});

const conversationSchema = new Schema<IConversation>({
  participants: { 
    type: [String], 
    required: [true, 'Participants are required'],
    validate: {
      validator: function(v: string[]) {
        return v && v.length >= 2;
      },
      message: 'At least 2 participants are required'
    }
  },
  aliases: { 
    type: Map, 
    of: String,
    default: new Map()
  },
  ndaSigned: { type: Boolean, default: false },
  paymentStatus: { 
    type: String, 
    enum: {
      values: ['pending', 'paid', 'unlocked'],
      message: 'Payment status must be pending, paid, or unlocked'
    },
    default: 'pending' 
  },
  zoomRequested: { type: Boolean, default: false },
  zoomLink: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^https:\/\/zoom\.us\//.test(v);
      },
      message: 'Invalid Zoom link format'
    }
  },
  adminApproved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  lastActivity: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

// Add indexes for better query performance
messageSchema.index({ conversationId: 1, timestamp: -1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ receiverId: 1 });
conversationSchema.index({ participants: 1 });
conversationSchema.index({ createdAt: -1 });

// Create models
const MessageModel: Model<IMessage> = mongoose.models.Message || mongoose.model<IMessage>("Message", messageSchema);
const ConversationModel: Model<IConversation> = mongoose.models.Conversation || mongoose.model<IConversation>("Conversation", conversationSchema);

// Rate limiting helper
const rateLimiters = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const userLimit = rateLimiters.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimiters.set(userId, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (userLimit.count >= maxRequests) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

export function setupSocket(server: HTTPServer) {
  const io = new Server(server, { 
    cors: { 
      origin: process.env.FRONTEND_URL || "*",
      methods: ["GET", "POST"]
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Middleware for authentication (optional)
  io.use((socket, next) => {
    // Add your authentication logic here
    // const token = socket.handshake.auth.token;
    // if (isValidToken(token)) {
    //   next();
    // } else {
    //   next(new Error("Authentication error"));
    // }
    next();
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("join", async (data) => {
      try {
        const { userId, role } = data;
        
        if (userId) {
          socket.data.userId = userId;
          socket.join(userId.toString());
        }
        
        if (role) {
          socket.data.role = role;
          
          // Join role-specific rooms
          if (role === 'admin') {
            socket.join('admin');
            console.log(`Admin ${userId} joined admin room`);
          } else if (role === 'superadmin') {
            socket.join('superadmin');
            console.log(`Superadmin ${userId} joined superadmin room`);
          }
        }
      } catch (error) {
        console.error("Error joining room:", error);
      }
    });

    socket.on("chatMessage", async (msg: Partial<IMessage>) => {
      try {
        // Rate limiting
        if (!checkRateLimit(socket.data.userId || socket.id)) {
          socket.emit("error", { 
            message: "Rate limit exceeded. Please slow down.", 
            code: "RATE_LIMIT" 
          });
          return;
        }

        // Enhanced validation
        if (!msg.conversationId || !msg.senderId || !msg.receiverId || !msg.content) {
          socket.emit("error", { 
            message: "Missing required message fields",
            code: "VALIDATION_ERROR"
          });
          return;
        }

        // Content sanitization (basic example)
        const sanitizedContent = msg.content.trim();
        if (sanitizedContent.length === 0) {
          socket.emit("error", { 
            message: "Message content cannot be empty",
            code: "VALIDATION_ERROR"
          });
          return;
        }

        // Check if conversation exists and user is participant
        const conversation = await ConversationModel.findById(msg.conversationId);
        if (!conversation) {
          socket.emit("error", { 
            message: "Conversation not found",
            code: "NOT_FOUND"
          });
          return;
        }

        if (!conversation.participants.includes(msg.senderId)) {
          socket.emit("error", { 
            message: "Unauthorized: You are not a participant in this conversation",
            code: "UNAUTHORIZED"
          });
          return;
        }

        // Create message
        const message = await MessageModel.create({
          ...msg,
          content: sanitizedContent,
          timestamp: new Date(),
          isAnonymous: msg.isAnonymous ?? true,
          ndaSigned: msg.ndaSigned ?? false,
          paymentStatus: msg.paymentStatus ?? 'pending',
          zoomRequested: msg.zoomRequested ?? false,
          adminApproved: msg.adminApproved ?? false,
          messageType: msg.messageType || 'text'
        });

        // Update conversation last activity
        await ConversationModel.findByIdAndUpdate(
          msg.conversationId,
          { lastActivity: new Date() }
        );

        // Check message limit
        const count = await MessageModel.countDocuments({ 
          conversationId: msg.conversationId 
        });
        const limit = parseInt(process.env.MESSAGE_LIMIT || '5');

        if (count >= limit && !conversation.adminApproved) {
          await ConversationModel.findByIdAndUpdate(
            msg.conversationId, 
            { adminApproved: false }
          );
          
          io.to("admin").emit("approvalNeeded", { 
            conversationId: msg.conversationId,
            messageCount: count,
            participants: conversation.participants
          });
          
          socket.emit("limitReached", { 
            conversationId: msg.conversationId,
            limit,
            currentCount: count
          });
          return;
        }

        // Emit to all participants and admin
        conversation.participants.forEach(participantId => {
          io.to(participantId).emit("chatMessage", message);
        });
        io.to("admin").emit("chatMessage", message);
        
        // Confirm to sender
        socket.emit("messageDelivered", { 
          messageId: message._id,
          timestamp: message.timestamp
        });

      } catch (error) {
        console.error("Error handling chat message:", error);
        socket.emit("error", { 
          message: "Failed to send message",
          code: "SERVER_ERROR",
          details: error instanceof Error ? error.message : "Unknown error"
        });
      }
    });

    socket.on("markAsRead", async ({ messageId }: { messageId: string }) => {
      try {
        if (!messageId) {
          socket.emit("error", { message: "Message ID is required" });
          return;
        }

        await MessageModel.findByIdAndUpdate(messageId, { isRead: true });
        socket.emit("messageRead", { messageId });

      } catch (error) {
        console.error("Error marking message as read:", error);
        socket.emit("error", { 
          message: "Failed to mark message as read",
          details: error instanceof Error ? error.message : "Unknown error"
        });
      }
    });

    socket.on("getConversationHistory", async ({ conversationId, page = 1, limit = 20 }: { 
      conversationId: string; 
      page?: number; 
      limit?: number; 
    }) => {
      try {
        if (!conversationId) {
          socket.emit("error", { message: "Conversation ID is required" });
          return;
        }

        const skip = (page - 1) * limit;
        const messages = await MessageModel.find({ conversationId })
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(limit)
          .lean();

        const totalMessages = await MessageModel.countDocuments({ conversationId });
        
        socket.emit("conversationHistory", {
          messages: messages.reverse(), // Reverse to show oldest first
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalMessages / limit),
            totalMessages,
            hasNext: skip + messages.length < totalMessages
          }
        });

      } catch (error) {
        console.error("Error fetching conversation history:", error);
        socket.emit("error", { 
          message: "Failed to fetch conversation history",
          details: error instanceof Error ? error.message : "Unknown error"
        });
      }
    });

    socket.on("adminApprove", async ({ conversationId }: { conversationId: string }) => {
      try {
        // Check if user has admin role
        if (socket.data.role !== 'admin') {
          socket.emit("error", { 
            message: "Unauthorized: Admin access required",
            code: "UNAUTHORIZED"
          });
          return;
        }

        if (!conversationId) {
          socket.emit("error", { message: "Conversation ID is required" });
          return;
        }

        const result = await ConversationModel.findByIdAndUpdate(
          conversationId, 
          { adminApproved: true },
          { new: true }
        );

        if (!result) {
          socket.emit("error", { 
            message: "Conversation not found",
            code: "NOT_FOUND"
          });
          return;
        }

        // Notify all participants
        result.participants.forEach(participantId => {
          io.to(participantId).emit("adminApproved", { conversationId });
        });
        
        socket.emit("approvalSuccess", { conversationId });

      } catch (error) {
        console.error("Error approving conversation:", error);
        socket.emit("error", { 
          message: "Failed to approve conversation",
          details: error instanceof Error ? error.message : "Unknown error"
        });
      }
    });

    socket.on("typing", ({ conversationId, isTyping }: { conversationId: string; isTyping: boolean }) => {
      if (!conversationId || !socket.data.userId) return;
      
      socket.to(conversationId).emit("userTyping", {
        userId: socket.data.userId,
        isTyping
      });
    });

    // Real-time form submission from founder/investor to admin
    socket.on("formSubmitted", async (data) => {
      try {
        if (data.type === "product") {
          // Save product submission
          const Product = require("./models/Product").default;
          const newProduct = await Product.create({
            ...data.form,
            founderId: data.userId,
            status: "pending"
          });
          io.to("admin").emit("formSubmitted", { type: "product", product: newProduct });
        } else if (data.type === "interest") {
          // Save interest submission
          const Interest = require("./models/Interest").default;
          const newInterest = await Interest.create({
            ...data.form,
            investorId: data.userId,
            status: "pending"
          });
          io.to("admin").emit("formSubmitted", { type: "interest", interest: newInterest });
        }
      } catch (error: any) {
        socket.emit("error", { message: "Failed to submit form", details: error instanceof Error ? error.message : String(error) });
      }
    });

    // Real-time admin review (approve/reject/request revision)
    socket.on("formReviewed", async (data) => {
      try {
        if (data.type === "product") {
          const Product = require("./models/Product").default;
          const updated = await Product.findByIdAndUpdate(
            data.productId,
            { status: data.status, adminFeedback: data.feedback },
            { new: true }
          );
          io.to(updated.founderId.toString()).emit("formReviewed", { type: "product", product: updated });
        } else if (data.type === "interest") {
          const Interest = require("./models/Interest").default;
          const updated = await Interest.findByIdAndUpdate(
            data.interestId,
            { status: data.status, adminFeedback: data.feedback },
            { new: true }
          );
          io.to(updated.investorId.toString()).emit("formReviewed", { type: "interest", interest: updated });
        }
      } catch (error: any) {
        socket.emit("error", { message: "Failed to review form", details: error instanceof Error ? error.message : String(error) });
      }
    });

    // Superadmin creates admin with credentials and permissions
    socket.on("createAdmin", async (data) => {
      try {
        if (socket.data.role !== "superadmin") {
          socket.emit("error", { message: "Unauthorized: Superadmin access required" });
          return;
        }
        const User = require("./models/User").default;
        const newAdmin = await User.create({
          username: data.username,
          password: data.password, // Hash in production
          email: data.email,
          role: "admin",
          userType: "admin",
          isAdmin: true,
          permissions: data.permissions || [],
        });
        io.to("superadmin").emit("adminCreated", { admin: newAdmin });
      } catch (error: any) {
        socket.emit("error", { message: "Failed to create admin", details: error instanceof Error ? error.message : String(error) });
      }
    });

    // Superadmin assigns a task to an admin
    socket.on("assignTask", async (data) => {
      try {
        if (socket.data.role !== "superadmin") {
          socket.emit("error", { message: "Unauthorized: Superadmin access required" });
          return;
        }
        const Task = require("./models/Task").default;
        const User = require("./models/User").default;
        const newTask = await Task.create({
          adminId: data.adminId,
          type: data.type,
          targetId: data.targetId,
          details: data.details,
        });
        await User.findByIdAndUpdate(data.adminId, { $push: { assignedTasks: newTask._id } });
        io.to(data.adminId.toString()).emit("taskAssigned", { task: newTask });
        io.to("superadmin").emit("taskAssigned", { task: newTask });
      } catch (error: any) {
        socket.emit("error", { message: "Failed to assign task", details: error instanceof Error ? error.message : String(error) });
      }
    });

    // Admin performs an action (logs to AdminAction, notifies superadmin)
    socket.on("adminAction", async (data) => {
      try {
        if (socket.data.role !== "admin") {
          socket.emit("error", { message: "Unauthorized: Admin access required" });
          return;
        }
        const AdminAction = require("./models/AdminAction").default;
        const action = await AdminAction.create({
          adminId: socket.data.userId,
          actionType: data.actionType,
          targetId: data.targetId,
          details: data.details,
        });
        io.to("superadmin").emit("adminActionLogged", { action });
      } catch (error: any) {
        socket.emit("error", { message: "Failed to log admin action", details: error instanceof Error ? error.message : String(error) });
      }
    });

    // Admin management events
    socket.on("adminCreated", (data) => {
      // This event is emitted from the backend API, just log it
      console.log("Admin created via API:", data);
    });

    socket.on("adminUpdated", (data) => {
      // This event is emitted from the backend API, just log it
      console.log("Admin updated via API:", data);
    });

    socket.on("adminDeleted", (data) => {
      // This event is emitted from the backend API, just log it
      console.log("Admin deleted via API:", data);
    });

    socket.on("disconnect", (reason) => {
      console.log(`Socket disconnected: ${socket.id}, reason: ${reason}`);
      
      // Clean up any user-specific data
      if (socket.data.userId) {
        rateLimiters.delete(socket.data.userId);
      }
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });

  return io;
}