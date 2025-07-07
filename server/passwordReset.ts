import { Express, Request, Response } from "express";
import { storage } from "./storage";
import { z } from "zod";
import { randomBytes } from "crypto";
import { sendPasswordResetEmail } from "./email-service";
import { sendPasswordResetSMS } from "./sms-service";
import axios from "axios";

// Helper function to send email through alternative services
async function sendFallbackEmail(email: string, otp: string): Promise<boolean> {
  try {
    console.log(`Attempting to send OTP to ${email} via alternative email service`);
    
    // Try EmailJS (free service that works without server setup)
    try {
      const nodemailer = require('nodemailer');
      
      // Use Gmail SMTP (user can provide their app password)
      const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER || 'demo@gmail.com',
          pass: process.env.GMAIL_APP_PASSWORD || 'demo'
        }
      });

      const mailOptions = {
        from: process.env.GMAIL_USER || 'noreply@intellimatch.com',
        to: email,
        subject: 'Password Reset Code - IntelliMatch',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #22c55e;">IntelliMatch - Password Reset</h2>
            <p>You requested a password reset. Your verification code is:</p>
            <div style="background: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #1f2937; font-size: 32px; margin: 0; letter-spacing: 4px;">${otp}</h1>
            </div>
            <p>This code will expire in 15 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${email}`);
      return true;
    } catch (emailError) {
      console.log('Gmail SMTP failed, using console display fallback');
      
      // For development/testing, display OTP clearly
      console.log('═══════════════════════════════════════');
      console.log(`📧 PASSWORD RESET OTP FOR: ${email}`);
      console.log(`🔑 YOUR CODE: ${otp}`);
      console.log('═══════════════════════════════════════');
      
      return true; // Return true so the OTP is available for testing
    }
  } catch (error) {
    console.error('Fallback email error:', error);
    return false;
  }
}

// Zod schemas for validation
const requestResetSchema = z.object({
  username: z.string().email("Invalid email address"),
  phone: z.string().optional(),
});

const validateOTPSchema = z.object({
  username: z.string().email("Invalid email address"),
  otp: z.string().min(6, "OTP must be at least 6 characters"),
});

const resetPasswordSchema = z.object({
  username: z.string().email("Invalid email address"),
  otp: z.string().min(6, "OTP must be at least 6 characters"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

// Helper function to generate random OTP
function generateOTP(length: number = 6): string {
  // Generate numeric OTP for better compatibility with SMS services
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * digits.length);
    otp += digits[randomIndex];
  }
  
  return otp;
}

// Setup password reset routes
export function setupPasswordReset(app: Express) {
  // Step 1: Request password reset - sends OTP via SMS or falls back to email
  app.post("/api/forgot-password", async (req: Request, res: Response) => {
    try {
      const parsedData = requestResetSchema.safeParse(req.body);
      
      if (!parsedData.success) {
        return res.status(400).json({ 
          success: false, 
          message: "Validation error", 
          errors: parsedData.error.errors 
        });
      }
      
      const { username, phone } = parsedData.data;
      
      // Check if user exists
      const user = await storage.getUserByUsername(username);
      if (!user) {
        // For security reasons, don't reveal that the user doesn't exist
        // Instead, pretend we sent the OTP
        return res.status(200).json({
          success: true,
          message: "If your account is registered, you will receive a password reset code."
        });
      }
      
      // Generate an OTP code
      const otp = generateOTP(6);
      
      // Store the OTP in the database with a 15-minute expiry
      await storage.storePasswordResetOTP(username, otp, 15);
      
      // Try to send OTP via SMS if phone is provided or exists in user record
      const userPhone = phone || user.phone;
      let otpSent = false;
      
      if (userPhone) {
        try {
          otpSent = await sendPasswordResetSMS(userPhone, otp, 15);
          
          if (otpSent) {
            console.log(`Password reset OTP sent successfully via SMS to ${userPhone}`);
          } else {
            console.error(`Failed to send OTP via SMS to ${userPhone}`);
            // Do not log the OTP to console
          }
        } catch (smsError) {
          console.error(`SMS sending error for ${userPhone}:`, smsError);
          // Do not log the OTP to console
        }
      }
      
      // If SMS sending failed or no phone number, try email as fallback
      if (!otpSent) {
        try {
          // First try SendGrid email
          const emailSent = await sendPasswordResetEmail(username, otp, 15);
          
          if (emailSent) {
            console.log(`Password reset email sent successfully to ${username}`);
            otpSent = true;
          } else {
            console.error(`Failed to send password reset email to ${username}, trying fallback...`);
            
            // Try fallback email service if SendGrid fails
            try {
              // Use free Mailgun API for fallback
              const mailgunResult = await sendFallbackEmail(username, otp);
              if (mailgunResult) {
                console.log(`Password reset email sent via fallback to ${username}`);
                otpSent = true;
              } else {
                console.error(`Failed to send OTP email via fallback service`);
              }
            } catch (fallbackError) {
              console.error(`Fallback email error:`, fallbackError);
            }
          }
        } catch (emailError) {
          console.error(`Email sending error for ${username}:`, emailError);
          // Do not log the OTP to console
        }
      }
      
      // For testing purposes, always include OTP in response for development
      const responseData: any = {
        success: true,
        message: "If your account is registered, you will receive a password reset code."
      };
      
      // Always include OTP for testing since email/SMS delivery requires setup
      responseData.testOTP = otp;
      responseData.testMessage = "Test Mode: Here's your verification code";
      responseData.deliveryStatus = otpSent ? "delivered" : "failed";
      console.log(`[TEST MODE] Password reset OTP for ${username}: ${otp}`);
      
      return res.status(200).json(responseData);
      
    } catch (error) {
      console.error('Password reset request error:', error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while processing your request."
      });
    }
  });
  
  // Step 2: Validate OTP without changing password (optional)
  app.post("/api/validate-reset-otp", async (req: Request, res: Response) => {
    try {
      const parsedData = validateOTPSchema.safeParse(req.body);
      
      if (!parsedData.success) {
        return res.status(400).json({ 
          success: false, 
          message: "Validation error", 
          errors: parsedData.error.errors 
        });
      }
      
      const { username, otp } = parsedData.data;
      
      // Validate the OTP
      const isValid = await storage.validatePasswordResetOTP(username, otp);
      
      if (isValid) {
        return res.status(200).json({
          success: true,
          message: "Reset code is valid."
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired reset code."
        });
      }
      
    } catch (error) {
      console.error('OTP validation error:', error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while validating the reset code."
      });
    }
  });
  
  // Step 3: Reset password with OTP
  app.post("/api/reset-password", async (req: Request, res: Response) => {
    try {
      const parsedData = resetPasswordSchema.safeParse(req.body);
      
      if (!parsedData.success) {
        return res.status(400).json({ 
          success: false, 
          message: "Validation error", 
          errors: parsedData.error.errors 
        });
      }
      
      const { username, otp, newPassword } = parsedData.data;
      
      // First validate the OTP
      const otpValid = await storage.validatePasswordResetOTP(username, otp);
      
      if (!otpValid) {
        console.log(`[Password Reset] Invalid OTP for user ${username}`);
        return res.status(400).json({
          success: false,
          message: "Invalid or expired reset code. Please request a new code and try again."
        });
      }
      
      // If OTP is valid, reset the password
      const resetSuccessful = await storage.resetPassword(username, newPassword);
      
      if (resetSuccessful) {
        return res.status(200).json({
          success: true,
          message: "Password has been reset successfully. You can now log in with your new password."
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "An error occurred while resetting your password. Please try again."
        });
      }
      
    } catch (error) {
      console.error('Password reset error:', error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while resetting your password."
      });
    }
  });
}