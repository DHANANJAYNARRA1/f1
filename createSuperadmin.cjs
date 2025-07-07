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

// Same password comparison function as backend
async function comparePasswords(supplied, stored) {
  try {
    const [hashed, salt] = stored.split('.');
    const hashedBuf = Buffer.from(hashed, 'hex');
    const suppliedBuf = await scryptAsync(supplied, salt, 64);
    return hashedBuf.equals(suppliedBuf);
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
}

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://dhananjay:MeqtZAxRa8KQYCVv@cluster0.5m21r7s.mongodb.net/";

// User schema matching the backend
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["superadmin", "admin", "founder", "investor", "organization", "mentor", "other"], required: true },
  isAdmin: { type: Boolean, default: false },
  userType: { type: String, enum: ["founder", "investor", "organization", "mentor", "admin", "superadmin", "other"], default: 'other' },
  uniqueId: { type: String, required: false, unique: true, sparse: true },
  otherTypeDesc: { type: String, required: false },
  phone: { type: String, required: false },
  profession: { type: String, required: false },
  interests: { type: String, required: false },
  organization: { type: String, required: false },
  alias: { type: String, required: false },
  permissions: [{ type: String }],
  assignedTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);

async function createSuperadmin() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    
    // Connect to MongoDB with proper options
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB successfully!');

    // Check if superadmin already exists
    const existingSuperadmin = await User.findOne({ role: 'superadmin' });
    if (existingSuperadmin) {
      // Always update the email field to ensure it is set
      if (existingSuperadmin.email !== 'superadmin@agritech.com') {
        await User.findByIdAndUpdate(existingSuperadmin._id, { email: 'superadmin@agritech.com' });
        console.log('✅ Updated superadmin email to superadmin@agritech.com');
      }
      console.log('⚠️  Superadmin already exists:');
      console.log(`   - Username: ${existingSuperadmin.username}`);
      console.log(`   - Email: ${existingSuperadmin.email || 'superadmin@agritech.com'}`);
      console.log(`   - Role: ${existingSuperadmin.role}`);
      console.log(`   - UserType: ${existingSuperadmin.userType}`);
      
      // Test the existing password
      const testPassword = 'superadmin123';
      const passwordValid = await comparePasswords(testPassword, existingSuperadmin.password);
      
      if (passwordValid) {
        console.log('✅ Existing superadmin password is valid!');
        console.log('🔑 Login credentials:');
        console.log(`   Username: ${existingSuperadmin.username}`);
        console.log(`   Password: ${testPassword}`);
      } else {
        console.log('❌ Existing superadmin password is invalid!');
        console.log('🔄 Updating password...');
        const newPasswordHash = await hashPassword(testPassword);
        await User.findByIdAndUpdate(existingSuperadmin._id, {
          password: newPasswordHash
        });
        console.log('✅ Password updated successfully!');
        console.log('🔑 Login credentials:');
        console.log(`   Username: ${existingSuperadmin.username}`);
        console.log(`   Password: ${testPassword}`);
      }
      
      await mongoose.disconnect();
      return;
    }

    console.log('🔄 Creating new superadmin user...');

    const password = 'superadmin123';
    const passwordHash = await hashPassword(password);

    // Create superadmin user
    const superadmin = new User({
      name: 'Super Admin',
      username: 'superadmin',
      email: 'superadmin@agritech.com',
      password: passwordHash,
      role: 'superadmin',
      userType: 'superadmin',
      uniqueId: 'SUP001',
      isAdmin: true,
      permissions: ['all'],
      createdAt: new Date()
    });

    await superadmin.save();
    
    console.log('✅ Superadmin created successfully!');
    console.log('📋 User Details:');
    console.log(`   - Name: ${superadmin.name}`);
    console.log(`   - Username: ${superadmin.username}`);
    console.log(`   - Email: ${superadmin.email}`);
    console.log(`   - Role: ${superadmin.role}`);
    console.log(`   - UserType: ${superadmin.userType}`);
    console.log(`   - UniqueId: ${superadmin.uniqueId}`);
    console.log(`   - isAdmin: ${superadmin.isAdmin}`);
    console.log(`   - Created: ${superadmin.createdAt}`);
    
    console.log('\n🔑 Login Credentials:');
    console.log(`   Username: ${superadmin.username}`);
    console.log(`   Password: ${password}`);
    
    // Verify the user can be found and password works
    console.log('\n🔍 Verifying user creation...');
    const foundUser = await User.findOne({ username: 'superadmin' });
    if (foundUser) {
      console.log('✅ User found in database');
      
      const passwordValid = await comparePasswords(password, foundUser.password);
      if (passwordValid) {
        console.log('✅ Password validation successful');
      } else {
        console.log('❌ Password validation failed');
      }
    } else {
      console.log('❌ User not found in database');
    }

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    console.log('\n🎉 Superadmin setup complete! You can now login with the credentials above.');
    
  } catch (error) {
    console.error('❌ Error creating superadmin:', error);
    
    if (error.code === 11000) {
      console.log('💡 This error usually means the superadmin already exists.');
      console.log('   Try running this script again to verify the existing user.');
    }
    
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the script
createSuperadmin(); 