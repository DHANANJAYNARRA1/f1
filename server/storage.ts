import { log } from "./vite";
import { IStorage } from "./storageInterface";
import { connectDB, isConnected } from "./db";
import { nanoid } from 'nanoid';
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

import { User, ProductInterest, ServiceRequest, Product, IUser, IProduct, IProductInterest, IServiceRequest } from "@shared/schema";
import { ICommunicationRequest } from "@shared/communicationSchema";
import { session } from "passport";
import UserModel from "./models/User.ts";
import ProductModel from "./models/Product.ts";
import InterestModel from "./models/InterestForm.ts";
import ServiceRequestModel from "./models/ServiceRequest.ts";
import CommunicationRequestModel from "./models/CommunicationRequest.ts";
import { hashPassword } from './auth';

// Initialize models function
function ensureModelsInitialized() {
  if (!UserModel) {
    throw new Error("User model is not initialized. Make sure database is connected.");
  }
  if (!ProductInterest) {
    throw new Error("ProductInterest model is not initialized. Make sure database is connected.");
  }
  if (!ServiceRequestModel) {
    throw new Error("ServiceRequest model is not initialized. Make sure database is connected.");
  }
  if (!ProductModel) {
    throw new Error("Product model is not initialized. Make sure database is connected.");
  }
  if (!CommunicationRequestModel) {
    throw new Error("CommunicationRequest model is not initialized. Make sure database is connected.");
  }
}

export const storage = {
  // USERS
  async getAllUsers() {
    ensureModelsInitialized();
    if (!isConnected()) {
      throw new Error("Database not connected");
    }
    if (!UserModel) throw new Error("User model not initialized");
    return UserModel.find() as unknown as IUser[];
  },
  async getUserByUsername(username: string) {
    ensureModelsInitialized();
    if (!isConnected()) {
      throw new Error("Database not connected");
    }
    if (!UserModel) throw new Error("User model not initialized");
    return UserModel.findOne({ username });
  },
  async getUser(id: string) {
    ensureModelsInitialized();
    if (!isConnected()) {
      throw new Error("Database not connected");
    }
    if (!UserModel) throw new Error("User model not initialized");
    return UserModel.findById(id);
  },
  async createUser(userData: any) {
    ensureModelsInitialized();
    if (!isConnected()) {
      throw new Error("Database not connected");
    }
    if (!UserModel) throw new Error("User model not initialized");
    
    // Generate a unique ID if one isn't provided
    if (!userData.uniqueId) {
      let prefix = '';
      if (userData.userType === 'founder') prefix = 'FNB';
      else if (userData.userType === 'investor') prefix = 'INV';
      else if (userData.userType === 'admin') prefix = 'ADM';
      else prefix = (userData.userType || 'USR').substring(0, 3).toUpperCase();

      // Find the highest used number for this prefix
      const users = await UserModel.find({ uniqueId: { $regex: `^${prefix}\\d{3}$` } });
      const usedNumbers = users
        .map(u => parseInt((u.uniqueId || '').replace(prefix, '')))
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
      userData.uniqueId = `${prefix}${String(nextNum).padStart(3, '0')}`;
    }
    
    const newUser = new UserModel(userData);
    await newUser.save();
    return newUser.toObject();
  },
  async updateUser(id: string, updates: any) {
    ensureModelsInitialized();
    if (!isConnected()) {
      throw new Error("Database not connected");
    }
    if (!UserModel) throw new Error("User model not initialized");
    return UserModel.findByIdAndUpdate(id, updates, { new: true });
  },
  async deleteUser(id: string) {
    ensureModelsInitialized();
    if (!isConnected()) {
      throw new Error("Database not connected");
    }
    if (!UserModel) throw new Error("User model not initialized");
    return UserModel.findByIdAndDelete(id);
  },
  async getUserByEmail(email: string) {
    ensureModelsInitialized();
    if (!isConnected()) {
      throw new Error("Database not connected");
    }
    if (!UserModel) throw new Error("User model not initialized");
    return UserModel.findOne({ email });
  },

  // PRODUCT INTERESTS
  async createProductInterest(data: any) {
    ensureModelsInitialized();
    if (!isConnected()) {
      throw new Error("Database not connected");
    }
    if (!ProductInterest) throw new Error("ProductInterest model not initialized");
    const interest = await ProductInterest.create(data);
    console.log(`[MongoDB] Product interest created: ${interest._id} for user ${interest.userId}`);
    return interest;
  },
  async getUserProductInterests(userId: string) {
    ensureModelsInitialized();
    if (!isConnected()) {
      throw new Error("Database not connected");
    }
    if (!ProductInterest) throw new Error("ProductInterest model not initialized");
    return ProductInterest.find({ userId });
  },
  async getAllProductInterests() {
    ensureModelsInitialized();
    if (!isConnected()) {
      throw new Error("Database not connected");
    }
    if (!ProductInterest) throw new Error("ProductInterest model not initialized");
    return ProductInterest.find();
  },

  // SERVICE REQUESTS
  async createServiceRequest(data: any) {
    ensureModelsInitialized();
    if (!isConnected()) {
      throw new Error("Database not connected");
    }
    if (!ServiceRequestModel) throw new Error("ServiceRequest model not initialized");
    return ServiceRequestModel.create(data);
  },
  async getUserServiceRequests(userId: string) {
    ensureModelsInitialized();
    if (!isConnected()) {
      throw new Error("Database not connected");
    }
    if (!ServiceRequestModel) throw new Error("ServiceRequest model not initialized");
    return ServiceRequestModel.find({ userId });
  },
  async getAllServiceRequests() {
    ensureModelsInitialized();
    if (!isConnected()) {
      throw new Error("Database not connected");
    }
    if (!ServiceRequestModel) throw new Error("ServiceRequest model not initialized");
    return ServiceRequestModel.find();
  },
  async deleteServiceRequest(id: string) {
    ensureModelsInitialized();
    if (!isConnected()) {
      throw new Error("Database not connected");
    }
    if (!ServiceRequestModel) throw new Error("ServiceRequest model not initialized");
    return ServiceRequestModel.findByIdAndDelete(id);
  },
  async updateServiceRequestStatus(id: string, status: string) {
    ensureModelsInitialized();
    if (!isConnected()) {
      throw new Error("Database not connected");
    }
    if (!ServiceRequestModel) throw new Error("ServiceRequest model not initialized");
    return ServiceRequestModel.findByIdAndUpdate(id, { status }, { new: true });
  },

  // PRODUCTS
  async createProduct(data: any) {
    ensureModelsInitialized();
    if (!isConnected()) {
      throw new Error("Database not connected");
    }
    if (!ProductModel) throw new Error("Product model not initialized");
    return ProductModel.create(data);
  },
  async getUserProducts(userId: string) {
    ensureModelsInitialized();
    if (!isConnected()) {
      throw new Error("Database not connected");
    }
    if (!ProductModel) throw new Error("Product model not initialized");
    return ProductModel.find({ userId });
  },
  async getAllProducts() {
    ensureModelsInitialized();
    if (!isConnected()) {
      throw new Error("Database not connected");
    }
    if (!ProductModel) throw new Error("Product model not initialized");
    return ProductModel.find();
  },
  async getVerifiedProducts() {
    ensureModelsInitialized();
    if (!isConnected()) {
      throw new Error("Database not connected");
    }
    if (!ProductModel) throw new Error("Product model not initialized");
    return ProductModel.find({ status: "verified" });
  },
  async updateProductStatus(productId: string, status: string) {
    ensureModelsInitialized();
    if (!isConnected()) {
      throw new Error("Database not connected");
    }
    if (!ProductModel) throw new Error("Product model not initialized");
    return ProductModel.findByIdAndUpdate(productId, { status }, { new: true });
  },
  async updateProduct(productId: string, updates: any) {
    ensureModelsInitialized();
    if (!isConnected()) {
      throw new Error("Database not connected");
    }
    if (!ProductModel) throw new Error("Product model not initialized");
    return ProductModel.findByIdAndUpdate(productId, updates, { new: true });
  },

  // INVESTOR REQUESTS
  async createInvestorRequest(data: any) {
    ensureModelsInitialized();
    if (!isConnected()) {
      throw new Error("Database not connected");
    }
    if (!ProductInterest) throw new Error("ProductInterest model not initialized");
    return ProductInterest.create(data);
  },
  async getAllInvestorRequests() {
    ensureModelsInitialized();
    if (!isConnected()) {
      throw new Error("Database not connected");
    }
    if (!ProductInterest) throw new Error("ProductInterest model not initialized");
    return ProductInterest.find();
  },

  async incrementProductInterestCount(productId: string) {
    ensureModelsInitialized();
    if (!isConnected()) {
      throw new Error("Database not connected");
    }
    if (!ProductModel) throw new Error("Product model not initialized");
    return ProductModel.findByIdAndUpdate(productId, { $inc: { interestCount: 1 } }, { new: true });
  },

  // PASSWORD RESET METHODS
  async storePasswordResetOTP(username: string, otp: string, expiryMinutes: number) {
    ensureModelsInitialized();
    if (!isConnected()) {
      throw new Error("Database not connected");
    }
    if (!UserModel) throw new Error("User model not initialized");
    
    const expiryTime = new Date(Date.now() + expiryMinutes * 60 * 1000);
    return UserModel.findOneAndUpdate(
      { username },
      { 
        passwordResetOTP: otp,
        passwordResetExpiry: expiryTime
      },
      { new: true }
    );
  },

  async validatePasswordResetOTP(username: string, otp: string) {
    ensureModelsInitialized();
    if (!isConnected()) {
      throw new Error("Database not connected");
    }
    if (!UserModel) throw new Error("User model not initialized");
    
    const user = await UserModel.findOne({ 
      username,
      passwordResetOTP: otp,
      passwordResetExpiry: { $gt: new Date() }
    });
    
    return !!user;
  },

  async resetPassword(username: string, newPassword: string) {
    ensureModelsInitialized();
    if (!isConnected()) {
      throw new Error("Database not connected");
    }
    if (!UserModel) throw new Error("User model not initialized");
    
    // Hash the new password
    const bcrypt = require('bcrypt');
    const passwordHash = await bcrypt.hash(newPassword, 10);
    
    const result = await UserModel.findOneAndUpdate(
      { username },
      { 
        password: newPassword,
        passwordHash: passwordHash,
        passwordResetOTP: null,
        passwordResetExpiry: null
      },
      { new: true }
    );
    
    return !!result;
  },

  async getProductsByIds(ids: string[]): Promise<Product[]> {
    ensureModelsInitialized();
    if (!isConnected()) {
      throw new Error("Database not connected");
    }
    if (!ProductModel) throw new Error("Product model not initialized");
    return ProductModel.find({ id: { $in: ids } });
  },

  async getProductsByFounder(founderId: string): Promise<Product[]> {
    ensureModelsInitialized();
    if (!isConnected()) {
      throw new Error("Database not connected");
    }
    if (!ProductModel) throw new Error("Product model not initialized");
    return ProductModel.find({ founderId });
  },

  async getInterestsByInvestor(investorId: string): Promise<ProductInterest[]> {
    ensureModelsInitialized();
    return (await InterestModel.find({ userId: investorId }).lean()) as unknown as ProductInterest[];
  },

  async createInterest(interest: Omit<ProductInterest, 'id' | 'createdAt'>): Promise<ProductInterest> {
    ensureModelsInitialized();
    const newInterest = new InterestModel(interest);
    await newInterest.save();
    return newInterest.toObject() as ProductInterest;
  },

  async createCommunicationRequest(request: Omit<ICommunicationRequest, 'id' | 'timestamp' | 'status'>): Promise<ICommunicationRequest> {
    ensureModelsInitialized();
    const newRequest = new CommunicationRequestModel(request);
    await newRequest.save();
    return newRequest.toObject() as ICommunicationRequest;
  },

  async getAdmins(): Promise<User[]> {
    ensureModelsInitialized();
    if (!UserModel) throw new Error("User model not initialized");
    return (await UserModel.find({ userType: 'admin' }).lean()) as unknown as IUser[];
  },

  async getProductById(id: string): Promise<Product | null> {
    ensureModelsInitialized();
    if (!isConnected()) {
      throw new Error("Database not connected");
    }
    if (!ProductModel) throw new Error("Product model not initialized");
    return (await ProductModel.findById(id).lean()) as unknown as IProduct | null;
  },

  async updateUserDocuments(userId: string, documents: { [key: string]: string }): Promise<IUser | null> {
    ensureModelsInitialized();
    if (!isConnected()) {
      throw new Error("Database not connected");
    }
    if (!UserModel) throw new Error("User model not initialized");
    return UserModel.findByIdAndUpdate(userId, { $set: { documents, verificationStatus: 'pending' } }, { new: true });
  },

  // Placeholder. In a real app, you might want to run migrations or seed data.
  async initialize(): Promise<void> {
    await connectDB();
    ensureModelsInitialized();
    const adminUser = await this.getUserByUsername('superadmin');
    if (!adminUser) {
        console.log('Creating superadmin user');
        const passwordHash = await hashPassword('superadmin123');
        await this.createUser({
            username: 'superadmin',
            email: 'superadmin@example.com',
            password: passwordHash,
            userType: 'superadmin',
            name: 'Super Admin',
            uniqueId: 'SUP001',
            verificationStatus: 'verified',
            isAdmin: true,
            createdAt: new Date(),
        });
    }
  }
};