// Migration script to update founder documents in MongoDB
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Adjust the following as needed for your project
const MONGO_URI = 'mongodb://localhost:27017/YOUR_DB_NAME';
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'founder-docs');

// Import your User model
const User = require('../models/User').default || require('../models/User');

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

async function migrateDocuments() {
  const files = fs.readdirSync(UPLOAD_DIR);
  const users = await User.find({ userType: 'founder' });
  for (const user of users) {
    let updated = false;
    user.documents = user.documents || {};
    for (const file of files) {
      // Example: businessPlan-123456.pdf
      const [docKey] = file.split('-');
      // Only update if the file is not already referenced
      if (user.documents[docKey] === undefined) {
        user.documents[docKey] = `/uploads/founder-docs/${file}`;
        updated = true;
      }
    }
    if (updated) {
      await user.save();
      console.log(`Updated documents for user: ${user.username}`);
    }
  }
  mongoose.disconnect();
}

migrateDocuments(); 