import mongoose from "mongoose";
import dotenv from "dotenv";
import { log } from "./vite";
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://dhananjay:MeqtZAxRa8KQYCVv@cluster0.5m21r7s.mongodb.net/";

export async function connectDB() {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      log("MongoDB already connected!", "database");
      return;
    }

    // Connection options for better reliability
    const options = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };

    await mongoose.connect(MONGODB_URI, options);
    
    // Set up connection event listeners
    mongoose.connection.on('connected', () => {
      log("MongoDB connected successfully!", "database");
    });

    mongoose.connection.on('error', (err) => {
      log(`MongoDB connection error: ${err.message}`, "database");
    });

    mongoose.connection.on('disconnected', () => {
      log("MongoDB disconnected", "database");
    });

    // Handle process termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      log("MongoDB connection closed through app termination", "database");
      process.exit(0);
    });

    log("MongoDB connected successfully!", "database");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    log("Failed to connect to MongoDB.", "database");
    throw error;
  }
}

// Function to check if database is connected
export function isConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

// Function to get connection status
export function getConnectionStatus(): string {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  return states[mongoose.connection.readyState as keyof typeof states] || 'unknown';
}

// Graceful disconnect function
export async function disconnectDB() {
  try {
    await mongoose.disconnect();
    log("MongoDB disconnected gracefully!", "database");
  } catch (error) {
    console.error("MongoDB disconnect error:", error);
    log("Failed to disconnect MongoDB.", "database");
  }
}