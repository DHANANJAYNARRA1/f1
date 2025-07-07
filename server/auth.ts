import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import express, { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { IUser } from "@shared/schema";
import createMemoryStore from "memorystore";
import { log } from "./vite";
import { isConnected } from "./db";
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import AdminAction from './models/AdminAction';
import { sendEmail } from './email-service';

declare global {
  namespace Express {
    interface User extends IUser {}
  }
}

const scryptAsync = promisify(scrypt);

// --- Multer Setup for Founder Documents ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const founderUploadsDir = path.join(__dirname, '..', '..', 'uploads', 'founder-docs');

const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, founderUploadsDir);
  },
  filename: (req, file, cb) => {
    const userId = req.body.userId;
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    // Example filename: 60b8d2...-idDocument-16227...-.pdf
    cb(null, `${userId}-${file.fieldname}-${uniqueSuffix}${extension}`);
  }
});

const upload = multer({ storage: storageConfig });
// --- End Multer Setup ---

// This function needs to be at the module's top level to be exported correctly.
export const uploadFounderDocuments = [
  // Use multer to handle 'idDocument' and 'businessDocument' files
  upload.fields([
    { name: 'idDocument', maxCount: 1 },
    { name: 'businessDocument', maxCount: 1 }
  ]),
  async (req: Request, res: Response) => {
    const { userId } = req.body;
    const files = req.files as any;

    if (!userId || !files || !files['idDocument'] || !files['businessDocument']) {
      return res.status(400).json({ success: false, message: 'Missing userId or required documents.' });
    }

    try {
      const idDocPath = `/uploads/founder-docs/${files['idDocument'][0].filename}`;
      const businessDocPath = `/uploads/founder-docs/${files['businessDocument'][0].filename}`;

      await storage.updateUser(userId, {
        documents: {
          id: idDocPath,
          business: businessDocPath,
        },
        verificationStatus: 'pending_verification',
      });

      // Fetch the updated user and log them in
      const user = await storage.getUser(userId);
      if (user) {
        req.login(user, (err) => {
          if (err) {
            log('Error logging in user after document upload: ' + err, 'auth.ts');
            return res.status(500).json({ success: false, message: 'Server error during login.' });
          }
          res.json({ success: true, message: 'Documents uploaded successfully. Your application is under review.' });
        });
      } else {
        res.status(404).json({ success: false, message: 'User not found after document upload.' });
      }
    } catch (error) {
      log('Error processing founder documents: ' + error, 'auth.ts');
      res.status(500).json({ success: false, message: 'Server error during document processing.' });
    }
  }
];

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  try {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error("Password comparison error:", error);
    return false;
  }
}

export function setupAuth(app: Express) {
  // Initialize the database (seed admin user if needed)
  if (typeof (storage as any).initialize === "function") {
    (storage as any).initialize().catch((err: any) => {
      console.error('Failed to initialize database:', err);
    });
  }

  
  // Create a memory store as a fallback
  const MemoryStore = createMemoryStore(session);
  const memoryStore = new MemoryStore({
    checkPeriod: 86400000, // prune expired entries every 24h
  });

  // Use memory store if storage session store has issues
  let sessionStore;
  if ('sessionStore' in storage && (storage as any).sessionStore) {
    sessionStore = (storage as any).sessionStore;
  } else {
    console.warn('Session store not found on storage, using memory store');
    sessionStore = memoryStore;
  }

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "productshowcase-secret-key",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // Check if database is connected
        if (!isConnected()) {
          console.error("[AUTH] Database not connected during login attempt");
          return done(new Error("Database connection error"));
        }

        console.log(`[AUTH] Login attempt for username/email: ${username}`);
        
        // Try to find by username first, then by email
        let user = await storage.getUserByUsername(username);
        if (!user) {
          user = await storage.getUserByEmail(username);
        }
        if (!user) {
          console.log(`[AUTH] User not found: ${username}`);
          return done(null, false, { message: "Invalid username or password" });
        }

        console.log(`[AUTH] User found: ${user.username} (${user.role})`);
        
        // Check if password is valid
        const isValidPassword = await comparePasswords(password, user.password);
        if (!isValidPassword) {
          console.log(`[AUTH] Invalid password for user: ${username}`);
          return done(null, false, { message: "Invalid username or password" });
        }

        // Block login for founders who are not approved
        if (user.userType === 'founder' && user.status !== 'approved') {
          return done(null, false, { message: "Your account is pending review by the admin. You will be notified when approved." });
        }

        console.log(`[AUTH] Login successful for user: ${username} (${user.role})`);
        return done(null, user);
      } catch (err) {
        console.error("[AUTH] Error during login:", err);
        return done(err);
      }
    }),
  );

  passport.serializeUser((user: any, done) => {
    const userId = user.id || user._id;
    if (!user || !userId) {
      return done(new Error('Invalid user object'), null);
    }
    done(null, userId.toString());
  });
  
  passport.deserializeUser(async (id: string, done) => {
    try {
      if (!isConnected()) {
        return done(new Error("Database connection error"), null);
      }
      
      const user = await storage.getUser(id);
      if (!user) {
        return done(new Error('User not found'), null);
      }
      done(null, user);
    } catch (err) {
      console.error("[AUTH] Error deserializing user:", err);
      done(err, null);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      if (!isConnected()) {
        return res.status(500).json({ success: false, message: "Database connection error" });
      }

      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ success: false, message: "Username already exists" });
      }

      const { userType, ...rest } = req.body;
      const passwordHash = await hashPassword(req.body.password);
      
      const userData = {
        ...rest,
        password: passwordHash,
        userType,
        isAdmin: false, // Explicitly set for regular users
        documents: {},
        documentsMeta: {},
        uniqueId: '',
        anonymousId: '',
      };
      
      const user = await storage.createUser(userData);

      req.login(user, (err) => {
        if (err) return next(err);
        
        const userObject = (user as any).toObject ? (user as any).toObject() : { ...user };
        delete userObject.password;

        let nextStep = 'dashboard';
        if (userType === 'founder') {
          nextStep = 'founder-documents';
        }
        
        return res.json({ success: true, user: userObject, nextStep });
      });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/login", (req, res, next) => {
    if (!isConnected()) {
      return res.status(500).json({ 
        success: false, 
        message: "Database connection error" 
      });
    }

    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        console.error("[LOGIN] Authentication error:", err);
        return next(err);
      }
      if (!user) {
        console.log(`[LOGIN] Authentication failed: ${info?.message || 'Unknown error'}`);
        return res.status(401).json({ 
          success: false, 
          message: info?.message || "Invalid username or password" 
        });
      }
      
      req.login(user, (err) => {
        if (err) {
          console.error("[LOGIN] Session error:", err);
          return next(err);
        }
        
        // Remove password from response
        const userResponse: any = user.toObject();
        if (userResponse.password) {
          delete userResponse.password;
        }
        
        console.log(`[LOGIN] User logged in successfully: ${user.username} (${user.role})`);
        
        res.status(200).json({
          success: true,
          user: userResponse
        });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.status(200).json({ 
        success: true, 
        message: "Logged out successfully" 
      });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        success: false, 
        message: "Not authenticated" 
      });
    }
    
    // Remove password from response
    const userResponse: any = req.user.toObject ? req.user.toObject() : { ...req.user };
    if (userResponse.password) {
      delete userResponse.password;
    }
    
    res.json({
      success: true,
      user: userResponse
    });
  });

  // Add product interest endpoint
  app.post("/api/product-interest", isAuthenticated, async (req, res, next) => {
    try {
      const { productId, source } = req.body;
      
      if (!productId) {
        return res.status(400).json({ 
          success: false, 
          message: "Product ID is required" 
        });
      }
      
      if (!req.user || !req.user._id) {
        return res.status(401).json({ 
          success: false, 
          message: "Authentication required" 
        });
      }
      
      console.log(`[interest] User ${req.user.name} (${req.user._id}) showing interest in product ${productId} via ${source || 'direct'}`);
      
      // Get product name based on ID - added to provide more useful information in admin dashboard
      let productName = "Unknown";
      switch(productId) {
        case "1": productName = "Hydroponics"; break;
        case "2": productName = "ECG Solutions"; break;
        case "3": productName = "HPS Systems"; break;
        case "4": productName = "Terrace Garden"; break;
      }
      
      const interest = await storage.createProductInterest({
        userId: req.user._id.toString(),
        userName: req.user.name as string,
        productId,
        source: source || null
      });
      
      // Force save to disk after recording interest to ensure data persistence
      if ('saveInterestsToDisk' in storage) {
        (storage as any).saveInterestsToDisk();
      }
      
      res.status(201).json({
        success: true,
        interest
      });
    } catch (err) {
      console.error('[interest] Error recording product interest:', err);
      next(err);
    }
  });

  // Get user product interests
  app.get("/api/product-interests", isAuthenticated, async (req, res, next) => {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({ 
          success: false, 
          message: "Authentication required" 
        });
      }
      
      const interests = await storage.getUserProductInterests(req.user._id.toString());
      res.json({
        success: true,
        interests
      });
    } catch (err) {
      next(err);
    }
  });

  // Admin routes
  app.get("/api/admin/users", isAdmin, async (req, res, next) => {
    try {
      console.log('[admin] Admin user requesting all users');
      
      // Force a refresh from disk before getting users to ensure we have the latest data
      if (typeof (storage as any).initialize === "function") {
        await (storage as any).initialize();
      }
      
      const users = await storage.getAllUsers();
      console.log(`[admin] Retrieved ${users.length} users from storage`);
      
      // Remove passwords from response
      const usersResponse = users.map(user => {
        const userObj: any = user.toObject ? user.toObject() : { ...user };
        if (userObj.password) {
          delete userObj.password;
        }
        return userObj;
      });
      
      // Log user count and details for debugging
      console.log(`[admin] Returning ${users.length} users to admin`);
      console.log(`[admin] User IDs: ${usersResponse.map(u => u.id).join(', ')}`);
      
      res.json({
        success: true,
        users: usersResponse
      });
    } catch (err) {
      console.error('[admin] Error getting users:', err);
      // Better error handling - return specific error message
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve users",
        error: process.env.NODE_ENV === 'development' ? (err as Error).message : 'Internal server error'
      });
    }
  });

  app.get("/api/admin/product-interests", isAdmin, async (req, res, next) => {
    try {
      // Force reload interests from disk
      if (typeof (storage as any).initialize === "function") {
        await (storage as any).initialize();
      }
      
      const interests = await storage.getAllProductInterests();
      
      // Log interest count for debugging
      console.log(`[admin] Returning ${interests.length} product interests to admin`);
      
      // Save all interests to disk after retrieving them
      if ('saveInterestsToDisk' in storage) {
        (storage as any).saveInterestsToDisk();
      }
      
      res.json({
        success: true,
        interests
      });
    } catch (err) {
      console.error('[admin] Error getting product interests:', err);
      next(err);
    }
  });
  
  app.get("/api/admin/service-requests", isAdmin, async (req, res, next) => {
    try {
      const requests = await storage.getAllServiceRequests();
      res.json({
        success: true,
        requests
      });
    } catch (err) {
      next(err);
    }
  });

  app.patch("/api/admin/service-requests/:id", isAdmin, async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const updatedRequest = await storage.updateServiceRequestStatus(id, status);
      
      if (!updatedRequest) {
        return res.status(404).json({
          success: false,
          message: "Service request not found"
        });
      }
      
      res.json({
        success: true,
        request: updatedRequest
      });
    } catch (err) {
      next(err);
    }
  });

  app.delete("/api/admin/service-requests/:id", isAdmin, async (req, res, next) => {
    try {
      const { id } = req.params;
      
      const deleted = await storage.deleteServiceRequest(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Service request not found"
        });
      }
      
      res.json({
        success: true,
        message: "Service request deleted successfully"
      });
    } catch (err) {
      next(err);
    }
  });

  // Superadmin routes
  app.get("/api/superadmin/admins", isAdminOrSuperadmin, async (req, res, next) => {
    try {
      const users = await storage.getAllUsers();
      const admins = users.filter(user => user.role === 'admin' || user.isAdmin);
      
      // Remove passwords from response
      const adminsResponse = admins.map(admin => {
        const adminObj = admin.toObject ? admin.toObject() : { ...admin };
        if (adminObj.password) {
          delete adminObj.password;
        }
        // Ensure email and _id are present
        adminObj.email = adminObj.email || adminObj.username;
        adminObj._id = adminObj._id || adminObj.id;
        return adminObj;
      });
      
      res.json({
        success: true,
        admins: adminsResponse
      });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/superadmin/admins", isAdminOrSuperadmin, async (req, res, next) => {
    try {
      const { name, email, password, permissions } = req.body;
      
      // Check if admin already exists
      const existingUser = await storage.getUserByUsername(email);
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: "Admin with this email already exists"
        });
      }
      
      // Assign uniqueId for admin
      const allUsers = await storage.getAllUsers();
      const prefix = 'ADM';
      const usedNumbers = allUsers
        .filter(u => u.userType === 'admin' && u.uniqueId && u.uniqueId.startsWith(prefix))
        .map(u => parseInt(u.uniqueId!.replace(prefix, '')))
        .filter(n => !isNaN(n))
        .sort((a, b) => a - b);
      let nextNum = 1;
      for (let i = 0; i < usedNumbers.length; i++) {
        if (usedNumbers[i] !== i + 1) {
          nextNum = i + 1;
          break;
        }
        nextNum = i + 2;
      }
      const uniqueId = `${prefix}${String(nextNum).padStart(3, '0')}`;

      // Create new admin
      const newAdmin = await storage.createUser({
        name,
        username: email,
        email,
        password: await hashPassword(password),
        role: 'admin',
        userType: 'admin',
        isAdmin: true,
        permissions: permissions || [],
        uniqueId
      });
      
      // Remove password from response
      const adminResponse: any = { ...newAdmin };
      if (adminResponse.password) {
        delete adminResponse.password;
      }
      
      // Emit real-time event to all superadmins
      if (req.app.get('io')) {
        req.app.get('io').to('superadmin').emit('adminCreated', { 
          admin: adminResponse,
          createdBy: req.user?.username || 'Superadmin'
        });
      }
      
      res.status(201).json({
        success: true,
        admin: adminResponse
      });
    } catch (err) {
      next(err);
    }
  });

  app.patch("/api/superadmin/admins/:id", isAdminOrSuperadmin, async (req, res, next) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const updatedAdmin = await storage.updateUser(id, updates);
      
      if (!updatedAdmin) {
        return res.status(404).json({ 
          success: false, 
          message: "Admin not found"
        });
      }
      
      // Remove password from response
      const adminResponse: any = { ...updatedAdmin };
      if (adminResponse.password) {
        delete adminResponse.password;
      }
      
      // Emit real-time event to all superadmins
      if (req.app.get('io')) {
        req.app.get('io').to('superadmin').emit('adminUpdated', { 
          admin: adminResponse,
          updatedBy: req.user?.username || 'Superadmin'
        });
      }
      
      res.json({
        success: true,
        admin: adminResponse
      });
    } catch (err) {
      next(err);
    }
  });

  app.delete("/api/superadmin/admins/:id", isAdminOrSuperadmin, async (req, res, next) => {
    try {
      const { id } = req.params;
      
      // Get admin info before deletion for the event
      const adminToDelete = await storage.getUser(id);
      
      const deleted = await storage.deleteUser(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: "Admin not found" });
      }
      
      // Emit real-time event to all superadmins
      if (req.app.get('io')) {
        req.app.get('io').to('superadmin').emit('adminDeleted', { 
          adminId: id,
          adminName: adminToDelete?.name || 'Unknown Admin',
          deletedBy: req.user?.username || 'Superadmin'
        });
      }
      
      res.json({ success: true, message: "Admin deleted successfully" });
    } catch (err) {
      next(err);
    }
  });

  app.delete("/api/users/:id", isAdminOrSuperadmin, async (req, res, next) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteUser(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      res.json({ success: true, message: "User deleted successfully" });
    } catch (err) {
      next(err);
    }
  });

  // Investor submits interest in a product
  app.post('/api/investor/requests', upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'document', maxCount: 1 }
  ]), async (req, res, next) => {
    try {
      const { investorId, productId, interestNote } = req.body;
      const timestamp = new Date();
      const status = 'pending';
      const target = 'admin';
      const statusHistory = [
        { stage: 'submitted', by: investorId, time: timestamp }
      ];
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      let profilePhotoUrl = '';
      let documentUrl = '';
      if (files?.profilePhoto?.[0]) profilePhotoUrl = `/uploads/${files.profilePhoto[0].filename}`;
      if (files?.document?.[0]) documentUrl = `/uploads/${files.document[0].filename}`;
      const request = await storage.createInvestorRequest({
        investorId,
        productId,
        interestNote,
        timestamp,
        status,
        target,
        statusHistory,
        profilePhotoUrl,
        documentUrl
      });
      res.status(201).json({ success: true, request });
    } catch (err) {
      next(err);
    }
  });

  // Admin fetches all investor requests
  app.get('/api/admin/investor-requests', isAdmin, async (req, res, next) => {
    try {
      const requests = await storage.getAllInvestorRequests();
      res.json({ success: true, requests });
    } catch (err) {
      next(err);
    }
  });

  // Superadmin fetches all investor requests
  app.get('/api/superadmin/investor-requests', isSuperadmin, async (req, res, next) => {
    try {
      const requests = await storage.getAllInvestorRequests();
      res.json({ success: true, requests });
    } catch (err) {
      next(err);
    }
  });

  app.patch('/api/products/:id/like', async (req, res, next) => {
    try {
      const { id } = req.params;
      const product = await storage.incrementProductInterestCount(id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      res.json({ success: true, interestCount: product.interestCount });
    } catch (err) {
      next(err);
    }
  });

  // NOTE: All founder registrations must use /api/auth/register-founder endpoint which saves all uploaded PDFs in the 'documents' field. Do not use /api/register or /api/register/founder for founders, as these do not save documents correctly.
  app.post(
    "/api/auth/register-founder",
    upload.fields([
      { name: 'pitchDeck', maxCount: 1 },
      { name: 'businessPlan', maxCount: 1 }
    ]),
    async (req, res, next) => {
      try {
        if (!isConnected()) {
          return res.status(500).json({ success: false, message: "Database connection error" });
        }
  
        const { username, password, ...rest } = req.body;
  
        const existingUser = await storage.getUserByUsername(username);
        if (existingUser) {
          return res.status(400).json({ success: false, message: "Username already exists" });
        }
  
        // Handle file uploads
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const documents: any = {};
        if (files.pitchDeck) {
          documents.pitchDeck = files.pitchDeck[0].path;
        }
        if (files.businessPlan) {
          documents.businessPlan = files.businessPlan[0].path;
        }
        
        const passwordHash = await hashPassword(password);

        const userData = {
          ...rest,
          username,
          password: passwordHash,
          documents,
          userType: 'founder',
          verificationStatus: 'pending',
          documentsMeta: {},
          uniqueId: '',
          anonymousId: '',
        };
        
        const user = await storage.createUser(userData);
  
        req.login(user, (err) => {
          if (err) return next(err);
          res.json({ success: true, user });
        });
      } catch (err) {
        console.error("[REGISTER FOUNDER] Error:", err);
        next(err);
      }
    }
  );

  // New endpoint for founder document uploads
  app.post('/api/auth/founder-documents', isAuthenticated, upload.any(), async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded.' });
    }

    const documentPaths: { [key: string]: string } = {};
    files.forEach(file => {
      documentPaths[file.fieldname] = file.path;
    });

    try {
      await storage.updateUserDocuments(req.user.id, documentPaths);
      res.json({ success: true, message: 'Documents uploaded successfully.' });
    } catch (error) {
      console.error("Error updating user documents:", error);
      res.status(500).json({ success: false, message: 'Server error while updating documents.' });
    }
  });

  app.post(
    "/api/auth/register",
    async (req, res, next) => {
      try {
        const { username, password, userType, ...rest } = req.body;
        
        // ... (existing user check)

        const passwordHash = await hashPassword(password);
        const user = await storage.createUser({
          username,
          password: passwordHash,
          userType,
          ...rest,
        });

        req.login(user, (err) => {
          if (err) return next(err);
          
          let nextStep = 'dashboard';
          if (userType === 'founder') {
            nextStep = 'founder-documents';
          }
          
          const userObject = (user as any).toObject ? (user as any).toObject() : user;
          delete userObject.password;

          return res.json({ success: true, user: userObject, nextStep });
        });
      } catch (err) {
        next(err);
      }
    }
  );

  app.get('/api/superadmin/admin-actions', isAdminOrSuperadmin, async (req, res, next) => {
    try {
      const actions = await AdminAction.find().sort({ createdAt: -1 }).limit(500);
      res.json({ success: true, actions });
    } catch (err) {
      next(err);
    }
  });

  // Assign task to admin endpoint
  app.post('/api/admin/assign-task', isAdminOrSuperadmin, async (req, res, next) => {
    try {
      const { adminId, type, targetId, details } = req.body;
      
      if (!adminId || !type || !details) {
        return res.status(400).json({ 
          success: false, 
          message: "Admin ID, task type, and details are required" 
        });
      }

      // Verify the admin exists
      const admin = await storage.getUser(adminId);
      if (!admin || (admin.role !== 'admin' && !admin.isAdmin)) {
        return res.status(404).json({ 
          success: false, 
          message: "Admin not found" 
        });
      }

      // Create task record (you can extend this based on your Task model)
      const task = {
        adminId,
        type,
        targetId: targetId || null,
        details,
        status: 'assigned',
        assignedBy: req.user?.id,
        assignedAt: new Date(),
        completed: false
      };

      // Save task to database (you'll need to implement this in storage)
      // For now, we'll just log it and return success
      console.log('Task assigned:', task);

      // Emit real-time event to the assigned admin
      if (req.app.get('io')) {
        req.app.get('io').to(`admin_${adminId}`).emit('taskAssigned', {
          task,
          assignedBy: req.user?.username || 'Superadmin'
        });
      }

      res.json({ 
        success: true, 
        message: "Task assigned successfully",
        task 
      });
    } catch (err) {
      next(err);
    }
  });
}

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ success: false, message: "Authentication required" });
}

export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && (req.user?.isAdmin || req.user?.role === 'admin' || req.user?.role === 'superadmin')) {
    return next();
  }
  res.status(403).json({ success: false, message: "Admin access required" });
}

export function isSuperadmin(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && req.user?.role === 'superadmin') {
    return next();
  }
  res.status(403).json({ success: false, message: "Superadmin access required" });
}

export function isAdminOrSuperadmin(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && (req.user?.role === 'superadmin' || req.user?.isAdmin || req.user?.role === 'admin')) {
    return next();
  }
  res.status(403).json({ success: false, message: "Admin or Superadmin access required" });
}

export const verifyUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { status } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }
  try {
    await storage.updateUser(userId, { verificationStatus: status });
    // Send email notification if approved
    if (status === 'approved') {
      const user = await storage.getUser(userId);
      if (user && user.email) {
        await sendEmail({
          to: user.email,
          from: 'noreply@metavertex.com',
          subject: 'Your METAVERTEX account has been approved!',
          text: 'Congratulations! Your account has been approved. You may now sign in and access your dashboard.',
          html: '<p>Congratulations! Your account has been <b>approved</b>. You may now sign in and access your dashboard.</p>'
        });
      }
    }
    res.json({ success: true, message: `User verification status updated to ${status}` });
  } catch (error) {
    log('Error updating user verification status: ' + error, 'auth.ts');
    res.status(500).json({ success: false, message: 'Failed to update verification status' });
  }
};

export const verifyUserDocument = async (req: Request, res: Response) => {
  const { userId, docKey } = req.params;
  const { status } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }
  try {
    const update = {};
    // @ts-expect-error: dynamic key assignment for MongoDB update
    update[`documentsMeta.${docKey}.status`] = status;
    await storage.updateUser(userId, update);
    // Notify founder via socket.io if possible
    const io = req.app.get('io');
    if (io) {
      io.to(userId).emit('documentStatusChanged', { docKey, status });
    }
    res.json({ success: true, message: `Document '${docKey}' status updated to ${status}` });
  } catch (error) {
    log('Error updating document status: ' + error, 'auth.ts');
    res.status(500).json({ success: false, message: 'Failed to update document status' });
  }
};
