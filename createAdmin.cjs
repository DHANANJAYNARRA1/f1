const fs = require('fs');
const path = require('path');
const { scrypt, randomBytes } = require('crypto');
const { promisify } = require('util');

const scryptAsync = promisify(scrypt);

async function createAdmin() {
  try {
    // Admin credentials
    const adminData = {
      name: "Admin User",
      username: "admin@agritech.com",
      password: "admin123", // Plain password for hashing
      userType: "admin",
      isAdmin: true,
      role: "admin",
      uniqueId: "ADM001"
    };

    // Hash the password
    const salt = randomBytes(16).toString('hex');
    const hash = await scryptAsync(adminData.password, salt, 64);
    const hashedPassword = hash.toString('hex') + '.' + salt;

    // Read existing users
    const usersPath = path.join(__dirname, 'data', 'users.json');
    const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf8'));

    // Create admin user object
    const adminUser = {
      "_id": "1",
      "id": "1",
      "name": adminData.name,
      "username": adminData.username,
      "password": hashedPassword,
      "userType": adminData.userType,
      "otherTypeDesc": "",
      "isAdmin": adminData.isAdmin,
      "role": adminData.role,
      "uniqueId": adminData.uniqueId,
      "createdAt": new Date().toISOString()
    };

    // Add admin to the beginning of users array
    usersData.users.unshift(adminUser);
    usersData.nextUserId = Math.max(...usersData.users.map(u => parseInt(u.id))) + 1;

    // Write back to file
    fs.writeFileSync(usersPath, JSON.stringify(usersData, null, 2));

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminData.username);
    console.log('🔑 Password:', adminData.password);
    console.log('🆔 Unique ID:', adminData.uniqueId);

  } catch (error) {
    console.error('❌ Error creating admin:', error);
  }
}

createAdmin(); 