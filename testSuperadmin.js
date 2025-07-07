const mongoose = require('mongoose');
const { scrypt, randomBytes } = require('crypto');
const { promisify } = require('util');
require('dotenv').config();

const scryptAsync = promisify(scrypt);

// Same hashing function as backend
async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split('.');
  const hashedBuf = Buffer.from(hashed, 'hex');
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return hashedBuf.equals(suppliedBuf);
}

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://dhananjay:MeqtZAxRa8KQYCVv@cluster0.5m21r7s.mongodb.net/";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["superadmin", "admin", "founder", "investor", "organization", "mentor", "other"], required: true },
  userType: { type: String, enum: ["founder", "investor", "organization", "mentor", "admin", "superadmin", "other"], required: true },
  uniqueId: { type: String, required: false, unique: true, sparse: true },
  email: { type: String, required: true, unique: true },
  isAdmin: { type: Boolean, default: false },
  permissions: [{ type: String }],
  assignedTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);

async function testSuperadmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all users
    const allUsers = await User.find({});
    console.log(`📊 Total users in database: ${allUsers.length}`);
    
    // Find superadmin specifically
    const superadmin = await User.findOne({ role: 'superadmin' });
    if (superadmin) {
      console.log('✅ Superadmin found:');
      console.log('   - Email:', superadmin.email);
      console.log('   - Username:', superadmin.username);
      console.log('   - Role:', superadmin.role);
      console.log('   - UserType:', superadmin.userType);
      console.log('   - isAdmin:', superadmin.isAdmin);
      console.log('   - UniqueId:', superadmin.uniqueId);
      console.log('   - Created:', superadmin.createdAt);
      console.log('   - Password field exists:', !!superadmin.password);
    } else {
      console.log('❌ No superadmin found in database');
      return;
    }

    // Test login with username (as backend does)
    const loginUser = await User.findOne({ username: 'superadmin' });
    if (loginUser) {
      console.log('✅ Login test successful - found user by username:', loginUser.email);
    } else {
      console.log('❌ Login test failed - no user found with username: superadmin');
    }

    // Test login with email
    const loginEmail = await User.findOne({ email: 'superadmin@agritech.com' });
    if (loginEmail) {
      console.log('✅ Login test successful - found user by email:', loginEmail.username);
    } else {
      console.log('❌ Login test failed - no user found with email: superadmin@agritech.com');
    }

    // Test password validation
    const testPassword = 'superadmin123';
    const storedPassword = superadmin.password;
    if (storedPassword) {
      const passwordValid = await comparePasswords(testPassword, storedPassword);
      console.log('🔐 Password validation test:', passwordValid ? '✅ PASSED' : '❌ FAILED');
      if (!passwordValid) {
        console.log('   - Stored password format:', storedPassword.substring(0, 20) + '...');
        console.log('   - Expected format: <hash>.<salt>');
      }
    } else {
      console.log('❌ No password field found in user document');
    }

    // Test what the backend would see
    console.log('\n🔍 Backend Login Simulation:');
    const backendUser = await User.findOne({ username: 'superadmin' });
    if (backendUser) {
      console.log('   - User found by username: ✅');
      console.log('   - Password field type:', typeof backendUser.password);
      console.log('   - Password field length:', backendUser.password ? backendUser.password.length : 0);
    } else {
      console.log('   - User NOT found by username: ❌');
    }

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error testing superadmin:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

testSuperadmin();