import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { nanoid } from 'nanoid';
import UserModel from './models/User';
import { hashPassword } from './auth';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const founderUploadsDir = path.join(__dirname, '..', 'uploads', 'founder-docs');

// Ensure uploads directory exists
if (!fs.existsSync(founderUploadsDir)) {
  fs.mkdirSync(founderUploadsDir, { recursive: true });
}

const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, founderUploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
  }
});

const upload = multer({ storage: storageConfig }).fields([
  { name: 'idDocument', maxCount: 1 },
  { name: 'businessDocument', maxCount: 1 },
  { name: 'pitchDeck', maxCount: 1 },
  { name: 'certificationOfIncorporation', maxCount: 1 },
  { name: 'companyOverview', maxCount: 1 },
  { name: 'memorandumOfAssociation', maxCount: 1 },
  { name: 'businessPlan', maxCount: 1 },
  { name: 'financialModel', maxCount: 1 },
  { name: 'intellectualProperty', maxCount: 1 },
  { name: 'executiveSummary', maxCount: 1 },
  { name: 'marketAnalysis', maxCount: 1 },
  { name: 'productRoadmap', maxCount: 1 },
  { name: 'useOfInvestments', maxCount: 1 },
]);

export const registerFounderWithDocuments = [
  (req: Request, res: Response, next: NextFunction) => {
    upload(req, res, function (err) {
      if (err) {
        // Multer error (file upload)
        console.error('[Founder Registration] Multer error:', err);
        return res.status(400).json({ success: false, message: err.message || 'File upload error' });
      }
      next();
    });
  },
  async (req: Request, res: Response) => {
    try {
      const requiredFields = [
        'name', 'username', 'password', 'userType'
      ];
      for (const field of requiredFields) {
        if (!req.body[field]) {
          return res.status(400).json({ success: false, message: `Missing required field: ${field}` });
        }
      }
      const files = req.files as Record<string, Express.Multer.File[]>;
      const requiredDocs = [
        'idDocument', 'businessDocument', 'pitchDeck', 'certificationOfIncorporation', 'companyOverview',
        'memorandumOfAssociation', 'businessPlan', 'financialModel', 'intellectualProperty',
        'executiveSummary', 'marketAnalysis'
      ];
      for (const doc of requiredDocs) {
        if (!files[doc] || files[doc].length === 0) {
          return res.status(400).json({ success: false, message: `Missing required document: ${doc}` });
        }
      }
      // Add optional docs if present
      const optionalDocs = ['productRoadmap', 'useOfInvestments'];
      // Prepare documents and documentsMeta
      const documents: Record<string, string> = {};
      const documentsMeta: Record<string, any> = {};
      for (const doc of [...requiredDocs, ...optionalDocs]) {
        if (files[doc] && files[doc][0]) {
          documents[doc] = `/uploads/founder-docs/${files[doc][0].filename}`;
          documentsMeta[doc] = {
            status: 'pending',
            url: documents[doc],
            reviewedBy: '',
            reviewedAt: null,
            rejectionReason: ''
          };
        }
      }
      // Log for debugging
      console.log('[Founder Registration] documents:', documents);
      console.log('[Founder Registration] documentsMeta:', documentsMeta);
      // Generate uniqueId and anonymousId
      let prefix = 'FNB';
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
      const uniqueId = `${prefix}${String(nextNum).padStart(3, '0')}`;
      const anonymousId = nanoid();
      // Hash password
      const passwordHash = await hashPassword(req.body.password);
      // Set email
      const email = req.body.username;
      // Logging for debugging
      console.log('[Founder Registration] Body:', req.body);
      console.log('[Founder Registration] Files:', Object.keys(files));
      // Create user
      const userData = {
        ...req.body,
        password: passwordHash,
        email,
        role: 'founder',
        userType: 'founder',
        status: 'pending',
        documents,
        documentsMeta,
        uniqueId,
        anonymousId,
      };
      const newUser = await UserModel.create(userData);
      return res.json({ success: true, user: newUser });
    } catch (err: any) {
      console.error('[Founder Registration] Error:', err);
      return res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
  }
]; 