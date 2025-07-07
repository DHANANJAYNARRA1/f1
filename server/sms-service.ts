import axios from 'axios';

// Use Fast2SMS API key from environment variables
if (!process.env.FAST2SMS_API_KEY) {
  console.warn("FAST2SMS_API_KEY environment variable is not set. SMS functionality will not work.");
}

const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY;

interface SMSParams {
  to: string;
  message: string;
}

/**
 * Send an SMS via Fast2SMS API
 * 
 * @param params Object containing recipient phone number and message content
 * @returns Promise resolving to a boolean indicating success/failure
 */
export async function sendSMS(params: SMSParams): Promise<boolean> {
  try {
    // If API key is not set, return false immediately
    if (!FAST2SMS_API_KEY) {
      console.error('Fast2SMS API key not set. Unable to send SMS.');
      return false;
    }

    const url = 'https://www.fast2sms.com/dev/bulkV2';
    
    // Log request details for debugging (removing sensitive data)
    console.log(`Sending SMS to ${params.to} with message length: ${params.message.length}`);
    
    // Updated request format to match Fast2SMS API V2 requirements
    const response = await axios({
      method: 'POST',
      url,
      headers: {
        'Authorization': FAST2SMS_API_KEY,
        'Content-Type': 'application/json'
      },
      data: {
        variables_values: params.message, // For template message, use this
        route: 'otp', // Use 'otp' for OTP messages
        numbers: params.to
      }
    });
    
    console.log('Fast2SMS API response:', response.data);
    
    if (response.data && response.data.return === true) {
      console.log(`SMS sent successfully to ${params.to}`);
      return true;
    } else {
      console.error(`Failed to send SMS to ${params.to}:`, response.data);
      return false;
    }
    
  } catch (error: any) {
    console.error('SMS sending error:', error.message);
    if (error.response) {
      console.error('Fast2SMS error response:', error.response.data);
    }
    return false;
  }
}

/**
 * Send password reset OTP via SMS
 * 
 * @param phone Phone number to send the OTP to
 * @param otp The OTP code
 * @param expiryMinutes Time until OTP expires in minutes
 * @returns Promise resolving to a boolean indicating success/failure
 */
export async function sendPasswordResetSMS(
  phone: string, 
  otp: string, 
  expiryMinutes: number = 15
): Promise<boolean> {
  const message = `METAVERTEX - Your password reset code is: ${otp}. This code will expire in ${expiryMinutes} minutes.`;
  
  return sendSMS({
    to: phone,
    message
  });
}