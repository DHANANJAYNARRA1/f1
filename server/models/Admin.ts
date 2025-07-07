import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';

const AdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  permissions: [{ type: String }],
  active: { type: Boolean, default: true },
  uniqueId: { type: String, unique: true, required: true },
  lastLogin: { type: Date }
}, { timestamps: true });

AdminSchema.methods.setPassword = async function(password: string) {
  this.passwordHash = await bcrypt.hash(password, 10);
};

AdminSchema.methods.validatePassword = async function(password: string) {
  return bcrypt.compare(password, this.passwordHash);
};

export default mongoose.model('Admin', AdminSchema);
