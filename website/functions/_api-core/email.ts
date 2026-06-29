import { Buffer } from 'node:buffer';

// In-memory token cache fallback
let inMemoryToken: string | null = null;
let inMemoryExpiry = 0;

async function getSendPulseToken(userId: string, secret: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  
  // 1. Check in-memory cache first
  if (inMemoryToken && inMemoryExpiry > now + 60) {
    return inMemoryToken;
  }
  
  // 2. Obtain a new token
  const tokenUrl = 'https://api.sendpulse.com/oauth/access_token';
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: userId,
      client_secret: secret,
    }),
  });
  
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to authenticate with SendPulse: HTTP ${response.status} - ${errText}`);
  }
  
  const data = (await response.json()) as any;
  const token = data.access_token;
  const expiresIn = data.expires_in || 3600;
  const expiry = now + expiresIn;
  
  inMemoryToken = token;
  inMemoryExpiry = expiry;
  
  return token;
}

export async function sendOtpEmail(
  to: string,
  otp: string,
  purpose: 'verification' | 'reset_password',
  env: any
): Promise<void> {
  const userId = env.SENDPULSE_API_USER_ID;
  const secret = env.SENDPULSE_API_SECRET;
  const storageDir = env.SENDPULSE_TOKEN_STORAGE || '/tmp/';
  const fromEmail = env.SENDPULSE_SENDER_EMAIL || env.VITE_SMTP_USER || 'contact@orbitsaas.cloud';

  if (!userId || !secret) {
    console.warn("SendPulse credentials not configured in environment. Mocking email sending.");
    console.log(`[MOCK EMAIL] To: ${to} | OTP: ${otp} | Purpose: ${purpose}`);
    return;
  }

  console.log(`Sending SendPulse email to ${to} from ${fromEmail}...`);

  const subject = purpose === 'verification' 
    ? 'LifeSolver - Verify Your Email'
    : 'LifeSolver - Reset Your Password';

  const htmlContent = purpose === 'verification'
    ? `
      <div style="font-family: Arial, sans-serif; padding: 25px; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
        <h2 style="color: #4f46e5; text-align: center; margin-bottom: 20px; font-weight: 800;">Welcome to LifeSolver!</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #475569;">Thank you for signing up. Please verify your email address by entering the following 6-digit verification code:</p>
        <div style="text-align: center; margin: 35px 0;">
          <span style="font-size: 36px; font-weight: 800; letter-spacing: 6px; color: #1e1b4b; background-color: #f1f5f9; padding: 12px 24px; border-radius: 8px; border: 1px dashed #4f46e5; display: inline-block;">${otp}</span>
        </div>
        <p style="color: #64748b; font-size: 14px; line-height: 1.5; text-align: center;">This code is valid for 15 minutes. If you did not request this code, you can safely ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
        <p style="text-align: center; font-size: 12px; color: #94a3b8;">LifeSolver &copy; ${new Date().getFullYear()}</p>
      </div>
    `
    : `
      <div style="font-family: Arial, sans-serif; padding: 25px; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
        <h2 style="color: #4f46e5; text-align: center; margin-bottom: 20px; font-weight: 800;">Reset Your Password</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #475569;">We received a request to reset your password. Please enter the following 6-digit reset code to proceed:</p>
        <div style="text-align: center; margin: 35px 0;">
          <span style="font-size: 36px; font-weight: 800; letter-spacing: 6px; color: #1e1b4b; background-color: #f1f5f9; padding: 12px 24px; border-radius: 8px; border: 1px dashed #4f46e5; display: inline-block;">${otp}</span>
        </div>
        <p style="color: #64748b; font-size: 14px; line-height: 1.5; text-align: center;">This code is valid for 15 minutes. If you did not request a password reset, please change your password immediately as someone else might have access to your credentials.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
        <p style="text-align: center; font-size: 12px; color: #94a3b8;">LifeSolver &copy; ${new Date().getFullYear()}</p>
      </div>
    `;

  const textContent = purpose === 'verification'
    ? `Welcome to LifeSolver! Thank you for signing up. Please verify your email address using this code: ${otp}`
    : `We received a request to reset your password. Please use this code to proceed: ${otp}`;

  // Get OAuth token
  const token = await getSendPulseToken(userId, secret);

  // Send request to SendPulse SMTP API
  const sendEmailUrl = 'https://api.sendpulse.com/smtp/emails';
  const response = await fetch(sendEmailUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: {
        subject,
        html: Buffer.from(htmlContent).toString('base64'),
        text: textContent,
        from: {
          name: 'LifeSolver',
          email: fromEmail,
        },
        to: [
          {
            name: to.split('@')[0],
            email: to,
          },
        ],
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`SendPulse SMTP API failed: HTTP ${response.status} - ${errText}`);
  }

  const result = (await response.json()) as any;
  if (!result.result) {
    throw new Error(`SendPulse API error: ${JSON.stringify(result)}`);
  }
}

