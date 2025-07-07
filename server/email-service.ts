import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY environment variable is not set. Email functionality will not work.");
}

const mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.error('SendGrid API key not set');
    return false;
  }
  
  try {
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text || '',
      html: params.html || '',
    });
    console.log(`Email sent successfully to ${params.to}`);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export async function sendPasswordResetEmail(
  email: string, 
  otp: string, 
  expiryMinutes: number = 15
): Promise<boolean> {
  // Use the specific sender email that you provided
  const fromEmail = 'dhananjay@sims.healthcare'; // Specified sender email
  const subject = 'METAVERTEX - Password Reset Code';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #4f46e5; padding: 20px; text-align: center; color: white;">
        <h1>METAVERTEX</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
        <h2>Password Reset</h2>
        <p>You requested a password reset. Please use the following code to reset your password:</p>
        <div style="background-color: #f5f5f5; padding: 15px; font-size: 24px; text-align: center; letter-spacing: 5px; font-weight: bold; margin: 20px 0;">
          ${otp}
        </div>
        <p>This code will expire in ${expiryMinutes} minutes.</p>
        <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
        <p>Thank you,<br>The METAVERTEX Team</p>
      </div>
      <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
        &copy; 2023 METAVERTEX. All rights reserved.
      </div>
    </div>
  `;
  
  const text = `
    METAVERTEX - Password Reset
    
    You requested a password reset. Please use the following code to reset your password:
    
    ${otp}
    
    This code will expire in ${expiryMinutes} minutes.
    
    If you didn't request a password reset, please ignore this email or contact support if you have concerns.
    
    Thank you,
    The METAVERTEX Team
  `;
  
  return sendEmail({
    to: email,
    from: fromEmail,
    subject,
    html,
    text
  });
}