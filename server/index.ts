import express from 'express';
import session from 'express-session';
import bcrypt from 'bcrypt';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist/public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Session configuration
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/founder-docs');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Data file paths
const USERS_FILE = path.join(__dirname, '../data/users.json');
const FOUNDER_DOCS_FILE = path.join(__dirname, '../data/founder-documents.json');

// Helper functions
async function readJsonFile(filePath: string) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { users: [], nextUserId: 1 };
  }
}

async function writeJsonFile(filePath: string, data: any) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// Routes
app.get('/api/user', (req, res) => {
  if (req.session.user) {
    res.json({ success: true, user: req.session.user });
  } else {
    res.status(401).json({ success: false, message: 'Not authenticated' });
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const { name, username, password, userType, phone, otherTypeDesc } = req.body;
    
    const usersData = await readJsonFile(USERS_FILE);
    
    // Check if user already exists
    const existingUser = usersData.users.find((u: any) => u.username === username);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    
    const hashedPassword = await hashPassword(password);
    const newUser = {
      id: String(usersData.nextUserId || usersData.users.length + 1),
      name,
      username,
      password: hashedPassword,
      userType,
      phone,
      otherTypeDesc,
      isAdmin: false,
      createdAt: new Date().toISOString()
    };
    
    usersData.users.push(newUser);
    usersData.nextUserId = (usersData.nextUserId || usersData.users.length) + 1;
    
    await writeJsonFile(USERS_FILE, usersData);
    
    res.json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const usersData = await readJsonFile(USERS_FILE);
    const user = usersData.users.find((u: any) => u.username === username);
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Remove password from session data
    const { password: _, ...userWithoutPassword } = user;
    req.session.user = userWithoutPassword;
    
    res.json({ success: true, user: userWithoutPassword });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Could not log out' });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

// Admin routes for founder document management
app.get('/api/admin/founder-documents', async (req, res) => {
  try {
    if (!req.session.user || (!req.session.user.isAdmin && req.session.user.userType !== 'admin')) {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const founderDocsData = await readJsonFile(FOUNDER_DOCS_FILE);
    res.json({ success: true, documents: founderDocsData.documents || [] });
  } catch (error) {
    console.error('Error fetching founder documents:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/api/admin/approve-founder', async (req, res) => {
  try {
    if (!req.session.user || (!req.session.user.isAdmin && req.session.user.userType !== 'admin')) {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const { userId } = req.body;
    const founderDocsData = await readJsonFile(FOUNDER_DOCS_FILE);
    
    const docIndex = founderDocsData.documents.findIndex((doc: any) => doc.userId === userId);
    if (docIndex !== -1) {
      founderDocsData.documents[docIndex].adminApproved = true;
      founderDocsData.documents[docIndex].status = 'admin-approved';
      await writeJsonFile(FOUNDER_DOCS_FILE, founderDocsData);
    }

    res.json({ success: true, message: 'Founder approved by admin' });
  } catch (error) {
    console.error('Error approving founder:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/api/admin/reject-founder', async (req, res) => {
  try {
    if (!req.session.user || (!req.session.user.isAdmin && req.session.user.userType !== 'admin')) {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const { userId } = req.body;
    const founderDocsData = await readJsonFile(FOUNDER_DOCS_FILE);
    
    const docIndex = founderDocsData.documents.findIndex((doc: any) => doc.userId === userId);
    if (docIndex !== -1) {
      founderDocsData.documents[docIndex].status = 'rejected';
      await writeJsonFile(FOUNDER_DOCS_FILE, founderDocsData);
    }

    res.json({ success: true, message: 'Founder rejected by admin' });
  } catch (error) {
    console.error('Error rejecting founder:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Super Admin routes
app.get('/api/superadmin/founder-documents', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.userType !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Super admin access required' });
    }

    const founderDocsData = await readJsonFile(FOUNDER_DOCS_FILE);
    // Filter to show only admin-approved documents
    const adminApprovedDocs = founderDocsData.documents?.filter((doc: any) => doc.adminApproved) || [];
    res.json({ success: true, documents: adminApprovedDocs });
  } catch (error) {
    console.error('Error fetching founder documents:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/api/superadmin/approve-founder', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.userType !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Super admin access required' });
    }

    const { userId } = req.body;
    const founderDocsData = await readJsonFile(FOUNDER_DOCS_FILE);
    
    const docIndex = founderDocsData.documents.findIndex((doc: any) => doc.userId === userId);
    if (docIndex !== -1) {
      founderDocsData.documents[docIndex].superAdminApproved = true;
      founderDocsData.documents[docIndex].status = 'approved';
      await writeJsonFile(FOUNDER_DOCS_FILE, founderDocsData);
    }

    res.json({ success: true, message: 'Founder approved by super admin' });
  } catch (error) {
    console.error('Error super admin approving founder:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/api/superadmin/reject-founder', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.userType !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Super admin access required' });
    }

    const { userId } = req.body;
    const founderDocsData = await readJsonFile(FOUNDER_DOCS_FILE);
    
    const docIndex = founderDocsData.documents.findIndex((doc: any) => doc.userId === userId);
    if (docIndex !== -1) {
      founderDocsData.documents[docIndex].status = 'rejected';
      await writeJsonFile(FOUNDER_DOCS_FILE, founderDocsData);
    }

    res.json({ success: true, message: 'Founder rejected by super admin' });
  } catch (error) {
    console.error('Error super admin rejecting founder:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// File upload route for founder documents
app.post('/api/upload-founder-documents', upload.fields([
  { name: 'idDocument', maxCount: 1 },
  { name: 'pitchDeck', maxCount: 1 },
  { name: 'certificationOfIncorporation', maxCount: 1 },
  { name: 'memorandumOfAssociation', maxCount: 1 },
  { name: 'companyOverview', maxCount: 1 },
  { name: 'businessDocument', maxCount: 1 },
  { name: 'businessPlan', maxCount: 1 },
  { name: 'financialModel', maxCount: 1 },
  { name: 'intellectualProperty', maxCount: 1 },
  { name: 'executiveSummary', maxCount: 1 },
  { name: 'marketAnalysis', maxCount: 1 },
  { name: 'productRoadmap', maxCount: 1 },
  { name: 'useOfInvestments', maxCount: 1 }
]), async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const documents: { [key: string]: string } = {};

    // Process uploaded files
    Object.keys(files).forEach(fieldName => {
      if (files[fieldName] && files[fieldName][0]) {
        documents[fieldName] = files[fieldName][0].filename;
      }
    });

    // Save document information
    const founderDocsData = await readJsonFile(FOUNDER_DOCS_FILE);
    if (!founderDocsData.documents) {
      founderDocsData.documents = [];
    }

    const newDocument = {
      userId: req.session.user.id,
      userName: req.session.user.name,
      userType: req.session.user.userType,
      documents,
      status: 'pending',
      adminApproved: false,
      superAdminApproved: false,
      createdAt: new Date().toISOString()
    };

    founderDocsData.documents.push(newDocument);
    await writeJsonFile(FOUNDER_DOCS_FILE, founderDocsData);

    res.json({ success: true, message: 'Documents uploaded successfully' });
  } catch (error) {
    console.error('Error uploading documents:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});