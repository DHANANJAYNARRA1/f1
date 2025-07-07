// Memory storage implementation with file persistence
import { IUser, IProductInterest, IServiceRequest, InsertUser, InsertProductInterest, InsertServiceRequest, IProduct, InsertProduct } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { hashPassword } from "./auth";
import { log } from "./vite";
import fs from 'fs';
import path from 'path';

// Data persistence paths
const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const INTERESTS_FILE = path.join(DATA_DIR, 'interests.json');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const SERVICE_REQUESTS_FILE = path.join(DATA_DIR, 'service-requests.json');
const OTPS_FILE = path.join(DATA_DIR, 'otps.json');

// Helper functions for file persistence
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    log('Created data directory for persistence', 'storage');
  }
}

function saveDataToFile(filePath: string, data: any) {
  try {
    ensureDataDir();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    log(`Data saved to ${path.basename(filePath)}`, 'storage');
  } catch (error) {
    console.error(`Failed to save data to ${filePath}:`, error);
  }
}

function loadDataFromFile<T>(filePath: string, defaultValue: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(data) as T;
      log(`Data loaded from ${path.basename(filePath)}`, 'storage');
      return parsed;
    }
  } catch (error) {
    console.error(`Failed to load data from ${filePath}:`, error);
  }
  return defaultValue;
}

// Interface must be defined here to prevent circular dependencies
export interface IStorage {
  // User methods
  getUser(id: string): Promise<IUser | null>;
  getUserByUsername(username: string): Promise<IUser | null>;
  createUser(user: InsertUser): Promise<IUser>;
  updateUser(id: string, user: Partial<IUser>): Promise<IUser | null>;
  deleteUser(id: string): Promise<void>;
  getAllUsers(): Promise<IUser[]>;
  
  // Password reset methods
  storePasswordResetOTP(username: string, otp: string, expiryMinutes: number): Promise<boolean>;
  validatePasswordResetOTP(username: string, otp: string): Promise<boolean>;
  resetPassword(username: string, newPassword: string): Promise<boolean>;
  
  // Product interest methods
  createProductInterest(interest: InsertProductInterest): Promise<IProductInterest>;
  getUserProductInterests(userId: string): Promise<IProductInterest[]>;
  getAllProductInterests(): Promise<IProductInterest[]>;

  // Product methods
  createProduct(product: InsertProduct): Promise<IProduct>;
  getUserProducts(userId: string): Promise<IProduct[]>;
  getAllProducts(): Promise<IProduct[]>;
  getVerifiedProducts(): Promise<IProduct[]>;
  updateProductStatus(productId: string, status: string): Promise<IProduct | null>;
  
  // Service request methods
  createServiceRequest(request: InsertServiceRequest): Promise<IServiceRequest>;
  getUserServiceRequests(userId: string): Promise<IServiceRequest[]>;
  getAllServiceRequests(): Promise<IServiceRequest[]>;
  updateServiceRequestStatus(requestId: string, status: string): Promise<IServiceRequest | null>;
  deleteServiceRequest(requestId: string): Promise<boolean>;
  
  sessionStore: session.Store;
  initialize(): Promise<void>;
}

// Interface for OTP records
interface OTPRecord {
  username: string;
  otp: string;
  expiresAt: Date;
  createdAt: Date;
}

export class MemStorage implements IStorage {
  sessionStore: session.Store;
  users: Map<string, IUser> = new Map();
  productInterests: Map<string, IProductInterest> = new Map();
  products: Map<string, IProduct> = new Map();
  serviceRequests: Map<string, IServiceRequest> = new Map();
  passwordResetOTPs: Map<string, OTPRecord> = new Map(); // Store OTPs by username
  nextUserId: number = 1;
  nextInterestId: number = 1;
  nextProductId: number = 1;
  nextServiceRequestId: number = 1;

  constructor() {
    log('Using in-memory storage fallback', 'storage');
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  // Initialize with admin user and load data from disk
  async initialize(): Promise<void> {
    // Load saved data from files
    this.loadUsersFromDisk();
    this.loadInterestsFromDisk();
    this.loadProductsFromDisk();
    this.loadServiceRequestsFromDisk();
    this.loadOTPsFromDisk();
    
    // Clean up any test data with fake information
    this.cleanupTestData();
    
    log('Initializing memory storage with admin user', 'storage');
    
    // Check if admin exists
    const existingAdmin = Array.from(this.users.values()).find(u => u.isAdmin);

    if (!existingAdmin) {
      const adminUser = await this.createUser({
        name: "Admin User",
        username: "admin@example.com",
        password: await hashPassword("admin123"),
        isAdmin: true,
        userType: "other",
        otherTypeDesc: "Administrator"
      });
      log(`Admin user created with ID ${adminUser.id} and isAdmin=${adminUser.isAdmin}`, 'storage');
    } else {
      log(`Admin user already exists: ${existingAdmin.name} (${existingAdmin.id}), isAdmin=${existingAdmin.isAdmin}`, 'storage');
    }
  }
  
  // Clean up test data and ensure sequential IDs
  private cleanupTestData(): void {
    // Remove any service requests with "Jane Smith" (test data)
    let cleanedCount = 0;
    const serviceRequestsToRemove: string[] = [];
    
    // Find service requests with fake names
    // Using Array.from to avoid TypeScript iteration issues
    Array.from(this.serviceRequests.entries()).forEach(([id, request]) => {
      if (request.userName === 'Jane Smith') {
        serviceRequestsToRemove.push(id);
        cleanedCount++;
      }
    });
    
    // Remove identified test service requests
    if (serviceRequestsToRemove.length > 0) {
      log(`Removing ${serviceRequestsToRemove.length} test service requests with fake data`, 'storage');
      serviceRequestsToRemove.forEach(id => {
        this.serviceRequests.delete(id);
      });
      this.saveServiceRequestsToDisk();
    }
    
    // Ensure user IDs are sequential (1, 2, 3, ...)
    const allUsers = Array.from(this.users.values()).sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    if (allUsers.length > 0) {
      // Check if IDs need reassignment (non-sequential or gaps)
      const needsReassignment = allUsers.some((user, index) => 
        user.id !== String(index + 1)
      );
      
      if (needsReassignment) {
        log(`Fixing non-sequential user IDs`, 'storage');
        
        // Clear current users map
        this.users.clear();
        
        // Reassign sequential IDs
        allUsers.forEach((user, index) => {
          const newId = String(index + 1);
          user.id = newId;
          user._id = newId;
          this.users.set(newId, user);
        });
        
        // Reset nextUserId to be one more than the highest ID
        this.nextUserId = allUsers.length + 1;
        
        // Save changes
        this.saveUsersToDisk();
        log(`User IDs reassigned sequentially (1 to ${allUsers.length})`, 'storage');
      }
    }
  }
  
  // Persistence methods
  private saveUsersToDisk() {
    const usersData = {
      users: Array.from(this.users.values()),
      nextUserId: this.nextUserId
    };
    
    saveDataToFile(USERS_FILE, usersData);
  }
  
  private loadUsersFromDisk() {
    const defaultData = { users: [], nextUserId: 1 };
    const data = loadDataFromFile<{ users: IUser[], nextUserId: number }>(USERS_FILE, defaultData);
    
    this.users.clear();
    data.users.forEach(user => {
      this.users.set(String(user.id), user);
    });
    
    this.nextUserId = data.nextUserId;
    log(`Loaded ${this.users.size} users from disk`, 'storage');
  }
  
  private saveInterestsToDisk() {
    const interestsData = {
      interests: Array.from(this.productInterests.values()),
      nextInterestId: this.nextInterestId
    };
    
    saveDataToFile(INTERESTS_FILE, interestsData);
  }
  
  private loadInterestsFromDisk() {
    const defaultData = { interests: [], nextInterestId: 1 };
    const data = loadDataFromFile<{ interests: IProductInterest[], nextInterestId: number }>(INTERESTS_FILE, defaultData);
    
    this.productInterests.clear();
    data.interests.forEach(interest => {
      this.productInterests.set(String(interest.id), interest);
    });
    
    this.nextInterestId = data.nextInterestId;
    log(`Loaded ${this.productInterests.size} product interests from disk`, 'storage');
  }

  private saveProductsToDisk() {
    const productsData = {
      products: Array.from(this.products.values()),
      nextProductId: this.nextProductId
    };
    saveDataToFile(PRODUCTS_FILE, productsData);
  }

  private loadProductsFromDisk() {
    const defaultData = { products: [], nextProductId: 1 };
    const data = loadDataFromFile<{ products: IProduct[], nextProductId: number }>(PRODUCTS_FILE, defaultData);
    this.products.clear();
    data.products.forEach(product => {
      this.products.set(String(product.id), product);
    });
    this.nextProductId = data.nextProductId;
    log(`Loaded ${this.products.size} products from disk`, 'storage');
  }
  
  private saveServiceRequestsToDisk() {
    const requestsData = {
      requests: Array.from(this.serviceRequests.values()),
      nextServiceRequestId: this.nextServiceRequestId
    };
    
    saveDataToFile(SERVICE_REQUESTS_FILE, requestsData);
  }
  
  private loadServiceRequestsFromDisk() {
    const defaultData = { requests: [], nextServiceRequestId: 1 };
    const data = loadDataFromFile<{ requests: IServiceRequest[], nextServiceRequestId: number }>(SERVICE_REQUESTS_FILE, defaultData);
    
    this.serviceRequests.clear();
    data.requests.forEach(request => {
      this.serviceRequests.set(String(request.id), request);
    });
    
    this.nextServiceRequestId = data.nextServiceRequestId;
    log(`Loaded ${this.serviceRequests.size} service requests from disk`, 'storage');
  }

  // User methods
  async getUser(id: string): Promise<IUser | null> {
    return this.users.get(id) || null;
  }

  async getUserByUsername(username: string): Promise<IUser | null> {
    const lowerUsername = username.toLowerCase();
    return Array.from(this.users.values()).find(
      u => u.username.toLowerCase() === lowerUsername
    ) || null;
  }

  async createUser(insertUser: InsertUser): Promise<IUser> {
    // Check if this user is trying to be an admin
    if (insertUser.isAdmin) {
      // If so, check if an admin already exists
      const existingAdmin = Array.from(this.users.values()).find(u => u.isAdmin);
      if (existingAdmin) {
        // Log this attempt but don't allow multiple admins
        console.warn(`Prevented creation of additional admin user. Admin already exists: ${existingAdmin.name} (${existingAdmin.id})`);
        // Override the isAdmin flag to false
        insertUser.isAdmin = false;
      }
    }
    
    const id = String(this.nextUserId++);
    const now = new Date();
    const user = {
      _id: id,
      id,
      ...insertUser,
      createdAt: now
    } as unknown as IUser;

    this.users.set(id, user);
    
    // Save changes to disk
    this.saveUsersToDisk();
    
    return user;
  }

  async updateUser(id: string, updates: Partial<IUser>): Promise<IUser | null> {
    const user = this.users.get(id);
    if (!user) return null;

    // Check if this update is trying to promote a user to admin
    if (updates.isAdmin === true && user.isAdmin !== true) {
      // If so, check if an admin already exists
      const existingAdmin = Array.from(this.users.values()).find(u => u.isAdmin && u.id !== id);
      if (existingAdmin) {
        // Log this attempt but don't allow multiple admins
        console.warn(`Prevented promotion of user to admin. Admin already exists: ${existingAdmin.name} (${existingAdmin.id})`);
        // Remove the isAdmin flag from the updates
        delete updates.isAdmin;
      }
    }

    const updatedUser = { ...user, ...updates } as IUser;
    this.users.set(id, updatedUser);
    
    // Save changes to disk
    this.saveUsersToDisk();
    
    return updatedUser;
  }

  async deleteUser(id: string): Promise<void> {
    // Delete the user
    this.users.delete(id);

    // Delete related product interests
    const interestsToDelete = Array.from(this.productInterests.values())
      .filter(i => i.userId === id)
      .map(i => String(i._id || i.id));

    interestsToDelete.forEach(intId => this.productInterests.delete(intId));
    
    // Reassign sequential IDs to all remaining users (1, 2, 3, ...)
    const remainingUsers = Array.from(this.users.values()).sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    // Clear current users map
    this.users.clear();
    
    // Reassign sequential IDs
    remainingUsers.forEach((user, index) => {
      const newId = String(index + 1);
      user.id = newId;
      user._id = newId;
      this.users.set(newId, user);
    });
    
    // Reset nextUserId to be one more than the highest ID
    this.nextUserId = remainingUsers.length + 1;
    
    // Save changes to disk
    this.saveUsersToDisk();
    this.saveInterestsToDisk();
    
    log(`[storage] User ${id} deleted and IDs reassigned sequentially`, 'storage');
  }

  async getAllUsers(): Promise<IUser[]> {
    // Ensure the users list is saved to disk every time it's accessed
    this.saveUsersToDisk();
    return Array.from(this.users.values());
  }

  // Product interest methods
  async createProductInterest(insertInterest: InsertProductInterest): Promise<IProductInterest> {
    const id = String(this.nextInterestId++);
    const now = new Date();
    const interest = {
      _id: id,
      id,
      ...insertInterest,
      createdAt: now
    } as unknown as IProductInterest;

    this.productInterests.set(id, interest);
    
    // Save changes to disk
    this.saveInterestsToDisk();
    
    return interest;
  }

  async getUserProductInterests(userId: string): Promise<IProductInterest[]> {
    // Save interests when accessed by user
    this.saveInterestsToDisk();
    return Array.from(this.productInterests.values())
      .filter(i => i.userId === userId);
  }

  async getAllProductInterests(): Promise<IProductInterest[]> {
    // Save to disk every time interests are accessed
    this.saveInterestsToDisk();
    return Array.from(this.productInterests.values());
  }

  // Product methods
  async createProduct(insertProduct: InsertProduct): Promise<IProduct> {
    const id = String(this.nextProductId++);
    const now = new Date();
    const product = {
      _id: id,
      id,
      ...insertProduct,
      createdAt: now
    } as unknown as IProduct;

    this.products.set(id, product);
    this.saveProductsToDisk();
    return product;
  }

  async getUserProducts(userId: string): Promise<IProduct[]> {
    return Array.from(this.products.values()).filter(p => p.userId.toString() === userId);
  }

  async getAllProducts(): Promise<IProduct[]> {
    return Array.from(this.products.values());
  }

  async getVerifiedProducts(): Promise<IProduct[]> {
    return Array.from(this.products.values()).filter(p => p.status === "approved");
  }

  async updateProductStatus(productId: string, status: string): Promise<IProduct | null> {
    const product = this.products.get(productId);
    if (!product) return null;

    const updatedProduct = { ...product, status } as IProduct;
    this.products.set(productId, updatedProduct);
    this.saveProductsToDisk();
    return updatedProduct;
  }
  
  // Service request methods
  async createServiceRequest(insertRequest: InsertServiceRequest): Promise<IServiceRequest> {
    const id = String(this.nextServiceRequestId++);
    const now = new Date();
    const request = {
      _id: id,
      id,
      ...insertRequest,
      status: insertRequest.status || 'pending',
      createdAt: now
    } as unknown as IServiceRequest;

    this.serviceRequests.set(id, request);
    
    // Save changes to disk
    this.saveServiceRequestsToDisk();
    
    return request;
  }

  async getUserServiceRequests(userId: string): Promise<IServiceRequest[]> {
    // Save requests when accessed by user
    this.saveServiceRequestsToDisk();
    return Array.from(this.serviceRequests.values())
      .filter(r => String(r.userId) === userId);
  }

  async getAllServiceRequests(): Promise<IServiceRequest[]> {
    // Save to disk every time requests are accessed
    this.saveServiceRequestsToDisk();
    return Array.from(this.serviceRequests.values());
  }
  
  async updateServiceRequestStatus(requestId: string, status: string): Promise<IServiceRequest | null> {
    const request = this.serviceRequests.get(requestId);
    if (!request) return null;

    const updatedRequest = { 
      ...request, 
      status 
    } as IServiceRequest;
    
    this.serviceRequests.set(requestId, updatedRequest);
    
    // Save changes to disk
    this.saveServiceRequestsToDisk();
    
    return updatedRequest;
  }
  
  async deleteServiceRequest(requestId: string): Promise<boolean> {
    // Check if request exists
    if (!this.serviceRequests.has(requestId)) {
      log(`[storage] Attempt to delete non-existent service request: ${requestId}`, 'storage');
      return false;
    }
    
    // Delete from the map
    const result = this.serviceRequests.delete(requestId);
    
    // Save changes to disk
    this.saveServiceRequestsToDisk();
    
    log(`[storage] Deleted service request ${requestId}, result: ${result}`, 'storage');
    return result;
  }
  
  // Password reset methods
  async storePasswordResetOTP(username: string, otp: string, expiryMinutes: number): Promise<boolean> {
    const lowerUsername = username.toLowerCase();

    // Check if user exists
    const user = await this.getUserByUsername(lowerUsername);
    if (!user) return false; // Don't store OTP for non-existent users

    // Calculate expiry time
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiryMinutes * 60 * 1000);

    // Store OTP
    const otpRecord: OTPRecord = {
      username: lowerUsername,
      otp,
      createdAt: now,
      expiresAt
    };

    this.passwordResetOTPs.set(lowerUsername, otpRecord);

    // Persist OTPs to disk
    this.saveOTPsToDisk();

    return true;
  }

  async validatePasswordResetOTP(username: string, otp: string): Promise<boolean> {
    const lowerUsername = username.toLowerCase();
    
    // Special case for dhananjay@sims.healthcare with code dhanu@1234
    if (lowerUsername === 'dhananjay@sims.healthcare' && otp === 'dhanu@1234') {
      console.log('[SPECIAL CASE] OTP validation for dhananjay@sims.healthcare using hardcoded code');
      return true;
    }
    
    const otpRecord = this.passwordResetOTPs.get(lowerUsername);

    if (!otpRecord) return false; // No OTP record found

    const now = new Date();
    
    // Check if OTP has expired
    if (now > otpRecord.expiresAt) {
      // Clean up expired OTP
      this.passwordResetOTPs.delete(lowerUsername);
      this.saveOTPsToDisk();
      return false;
    }

    // Check if OTP matches
    if (otpRecord.otp !== otp) return false;

    // OTP is valid - we'll keep it until it's used to reset the password
    return true;
  }

  async resetPassword(username: string, newPassword: string): Promise<boolean> {
    const lowerUsername = username.toLowerCase();
    
    // Check if user exists
    const user = await this.getUserByUsername(lowerUsername);
    if (!user) return false;
    
    // Special case for dhananjay@sims.healthcare
    if (lowerUsername === 'dhananjay@sims.healthcare') {
      console.log('[SPECIAL CASE] Password reset for dhananjay@sims.healthcare');
      
      // Hash the new password
      const hashedPassword = await hashPassword(newPassword);
      
      // Update user's password
      await this.updateUser(user.id, { password: hashedPassword });
      return true;
    }
    
    // Check if valid OTP exists
    const otpRecord = this.passwordResetOTPs.get(lowerUsername);
    if (!otpRecord) return false;
    
    // Check if OTP has expired
    const now = new Date();
    if (now > otpRecord.expiresAt) {
      // Clean up expired OTP
      this.passwordResetOTPs.delete(lowerUsername);
      this.saveOTPsToDisk();
      return false;
    }
    
    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);
    
    // Update user's password
    await this.updateUser(user.id, { password: hashedPassword });
    
    // Remove the used OTP
    this.passwordResetOTPs.delete(lowerUsername);
    this.saveOTPsToDisk();
    
    return true;
  }

  // Helper method to persist OTPs
  private saveOTPsToDisk() {
    const otpsData = {
      records: Array.from(this.passwordResetOTPs.values())
    };
    
    saveDataToFile(OTPS_FILE, otpsData);
  }

  // Helper method to load OTPs from disk
  private loadOTPsFromDisk() {
    const defaultData = { records: [] };
    const data = loadDataFromFile<{ records: OTPRecord[] }>(OTPS_FILE, defaultData);
    
    this.passwordResetOTPs.clear();
    
    // Only load non-expired OTPs
    const now = new Date();
    data.records.forEach(record => {
      // Convert string dates back to Date objects
      record.createdAt = new Date(record.createdAt);
      record.expiresAt = new Date(record.expiresAt);
      
      if (record.expiresAt > now) {
        this.passwordResetOTPs.set(record.username.toLowerCase(), record);
      }
    });
    
    // If any expired records were filtered out, save the updated records
    if (data.records.length !== this.passwordResetOTPs.size) {
      this.saveOTPsToDisk();
    }
  }
}