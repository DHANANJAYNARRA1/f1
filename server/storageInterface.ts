import { IUser, IProductInterest, IServiceRequest, InsertUser, InsertProductInterest, InsertServiceRequest, InsertProduct, IProduct } from "@shared/schema";
import session from "express-session";

// Define the storage interface
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
  getProductById: (id: string) => Promise<IProduct | null>;
  getProductsByIds: (ids: string[]) => Promise<IProduct[]>;
  getProductsByFounder: (founderId: string) => Promise<IProduct[]>;
  createInterest: (interest: Omit<IProductInterest, 'id' | 'createdAt'>) => Promise<IProductInterest>;
  getInterestsByInvestor: (investorId: string) => Promise<IProductInterest[]>;

  // Service request methods
  createServiceRequest(request: InsertServiceRequest): Promise<IServiceRequest>;
  getUserServiceRequests(userId: string): Promise<IServiceRequest[]>;
  getAllServiceRequests(): Promise<IServiceRequest[]>;
  updateServiceRequestStatus(requestId: string, status: string): Promise<IServiceRequest | null>;
  deleteServiceRequest(requestId: string): Promise<boolean>;
  
  // Session and initialization
  sessionStore: session.Store;
  initialize(): Promise<void>;

  // Communication Requests
  createCommunicationRequest: (request: Omit<IServiceRequest, 'id' | 'timestamp' | 'status'>) => Promise<IServiceRequest>;
  getCommunicationRequests: (userId: string, userType: string) => Promise<IServiceRequest[]>;
}