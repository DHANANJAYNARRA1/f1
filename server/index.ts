import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import fs from 'fs/promises';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Serve static files
app.use(express.static(path.join(__dirname, '../dist/public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/founder-docs');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.pdf');
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

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
  return bcrypt.hash(password, saltRounds);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Routes
app.get('/api/user', (req, res) => {
  if (req.session.user) {
    res.json({ success: true, user: req.session.user });
  } else {
    res.status(401).json({ success: false, message: 'Not authenticated' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const usersData = await readJsonFile(path.join(__dirname, '../data/users.json'));
    
    const user = usersData.users.find((u: any) => u.username === username);
    
    if (user && await verifyPassword(password, user.password)) {
      req.session.user = {
        id: user.id,
        name: user.name,
        username: user.username,
        userType: user.userType,
        isAdmin: user.isAdmin || false,
        role: user.role || user.userType
      };
      res.json({ success: true, user: req.session.user });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const { name, username, password, userType } = req.body;
    const usersData = await readJsonFile(path.join(__dirname, '../data/users.json'));
    
    // Check if user already exists
    const existingUser = usersData.users.find((u: any) => u.username === username);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    
    const hashedPassword = await hashPassword(password);
    const newUser = {
      _id: String(usersData.users.length + 1),
      id: String(usersData.users.length + 1),
      name,
      username,
      password: hashedPassword,
      userType,
      isAdmin: false,
      createdAt: new Date().toISOString()
    };
    
    usersData.users.push(newUser);
    await writeJsonFile(path.join(__dirname, '../data/users.json'), usersData);
    
    res.json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
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

// Document management routes
app.get('/api/documents', async (req, res) => {
  try {
    // Mock document data - in a real app, this would come from a database
    const documents = [
      {
        id: '1',
        fileName: 'business-plan.pdf',
        filePath: '/uploads/founder-docs/businessPlan-1751542331363-657685144.pdf',
        documentType: 'businessPlan',
        uploadedAt: '2025-01-01T10:00:00Z',
        status: 'pending',
        userId: '5',
        userName: 'John Founder'
      },
      {
        id: '2',
        fileName: 'financial-model.pdf',
        filePath: '/uploads/founder-docs/financialModel-1751542331364-356339444.pdf',
        documentType: 'financialModel',
        uploadedAt: '2025-01-01T11:00:00Z',
        status: 'approved',
        userId: '5',
        userName: 'John Founder'
      }
    ];
    
    res.json({ success: true, documents });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch documents' });
  }
});

app.get('/api/documents/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Mock user-specific documents
    const documents = [
      {
        id: '1',
        fileName: 'my-business-plan.pdf',
        filePath: '/uploads/founder-docs/businessPlan-1751542331363-657685144.pdf',
        documentType: 'businessPlan',
        uploadedAt: '2025-01-01T10:00:00Z',
        status: 'pending',
        userId: userId,
        userName: 'Current User'
      }
    ];
    
    res.json({ success: true, documents });
  } catch (error) {
    console.error('Error fetching user documents:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user documents' });
  }
});

app.get('/api/documents/view/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    
    // Map document IDs to actual file paths
    const documentMap: { [key: string]: string } = {
      '1': path.join(__dirname, '../uploads/founder-docs/businessPlan-1751542331363-657685144.pdf'),
      '2': path.join(__dirname, '../uploads/founder-docs/financialModel-1751542331364-356339444.pdf')
    };
    
    const filePath = documentMap[documentId];
    
    if (!filePath) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }
    
    // Check if file exists
    try {
      await fs.access(filePath);
      res.sendFile(filePath);
    } catch (error) {
      res.status(404).json({ success: false, message: 'File not found on disk' });
    }
  } catch (error) {
    console.error('Error serving document:', error);
    res.status(500).json({ success: false, message: 'Failed to serve document' });
  }
});

app.post('/api/documents/:documentId/approve', async (req, res) => {
  try {
    const { documentId } = req.params;
    
    // Check if user is admin or super admin
    if (!req.session.user || (!req.session.user.isAdmin && req.session.user.role !== 'admin')) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    // In a real app, update the document status in the database
    console.log(`Document ${documentId} approved by ${req.session.user.name}`);
    
    res.json({ success: true, message: 'Document approved successfully' });
  } catch (error) {
    console.error('Error approving document:', error);
    res.status(500).json({ success: false, message: 'Failed to approve document' });
  }
});

app.post('/api/documents/:documentId/reject', async (req, res) => {
  try {
    const { documentId } = req.params;
    
    // Check if user is admin or super admin
    if (!req.session.user || (!req.session.user.isAdmin && req.session.user.role !== 'admin')) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    // In a real app, update the document status in the database
    console.log(`Document ${documentId} rejected by ${req.session.user.name}`);
    
    res.json({ success: true, message: 'Document rejected successfully' });
  } catch (error) {
    console.error('Error rejecting document:', error);
    res.status(500).json({ success: false, message: 'Failed to reject document' });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});