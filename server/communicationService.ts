// Mentor communication service logic
// This is a placeholder for mentor communication table logic (to be implemented with real DB logic)
import mongoose from "mongoose";

const mentorCommunicationSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  role: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const MentorCommunication = mongoose.models.MentorCommunication || mongoose.model("MentorCommunication", mentorCommunicationSchema);


export async function createMentorCommunication({ senderId, receiverId, role, message, type }: any) {
  const comm = new MentorCommunication({ senderId, receiverId, role, message, type });
  await comm.save();
  return comm.toObject();
}

export async function getMentorCommunicationsForUser(userId: string) {
  return MentorCommunication.find({
    $or: [
      { senderId: userId },
      { receiverId: userId }
    ]
  }).sort({ createdAt: -1 }).lean();
}
