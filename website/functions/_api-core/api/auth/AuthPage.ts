import { errorResponse, jsonResponse } from '../../utils';
// Note: In Cloudflare Workers, you can import node built-ins using the node: prefix if compatibility flags are set
import crypto from "node:crypto";

// Basic JWT mock/placeholder (In a real scenario, use a proper Edge JWT library like @tsndr/cloudflare-worker-jwt)
async function generateToken(payload: any, secret: string) {
  // A mock implementation for the scaffold
  return "mock.jwt.token";
}

function hashPassword(pw: string): string {
  return crypto
      .createHash("sha256")
      .update(pw + "lifeos-salt-v1")
      .digest("hex");
}

import { sendOtpEmail } from '../../email';

export async function handleAuthRoute(context: PagesFunctionContext<Env>): Promise<Response | null> {
  const url = new URL(context.request.url);
  const method = context.request.method;

  if (!url.pathname.startsWith('/api/auth')) {
    return null;
  }

  try {
    if (url.pathname.endsWith('/register') && method === 'POST') {
      const body = await context.request.json() as any;
      const { name, email, password } = body;
      
      if (!email || !password) return errorResponse("Missing email or password", 400);
      
      // Check if user exists
      const { results: existing } = await context.env.DB.prepare(
        "SELECT id, is_verified FROM users WHERE email = ?"
      ).bind(email).all();
      
      const userRecord = existing?.[0] as any;
      
      if (userRecord) {
        if (userRecord.is_verified) {
          return errorResponse("User already exists", 400);
        }
        
        // User exists but is not verified. Re-generate OTP code and send.
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
        
        // Delete old OTPs first
        await context.env.DB.prepare("DELETE FROM otps WHERE email = ?").bind(email).run();
        
        await context.env.DB.prepare(
          "INSERT INTO otps (id, email, otp_code, purpose, expires_at) VALUES (?, ?, ?, ?, ?)"
        ).bind(crypto.randomUUID(), email, otpCode, "verification", expiresAt).run();
        
        await sendOtpEmail(email, otpCode, "verification", context.env);
        
        return jsonResponse({
          success: true,
          message: "Verification code sent to email."
        });
      }

      // Old flow created user here. We now skip this.
      
      // Generate verification code
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      
      // Delete any old OTPs first
      await context.env.DB.prepare("DELETE FROM otps WHERE email = ? AND purpose = 'verification'").bind(email).run();
      
      await context.env.DB.prepare(
        "INSERT INTO otps (id, email, otp_code, purpose, expires_at) VALUES (?, ?, ?, ?, ?)"
      ).bind(crypto.randomUUID(), email, otpCode, "verification", expiresAt).run();
      
      await sendOtpEmail(email, otpCode, "verification", context.env);
      
      return jsonResponse({
        success: true,
        message: "Verification code sent to email."
      });
    }

    if (url.pathname.endsWith('/verify') && method === 'POST') {
      const body = await context.request.json() as any;
      const { email, otp, name, password } = body;

      if (!email || !otp) return errorResponse("Missing email or verification code", 400);

      // Query OTP
      const { results: otps } = await context.env.DB.prepare(
        "SELECT * FROM otps WHERE email = ? AND otp_code = ? AND purpose = ? ORDER BY created_at DESC LIMIT 1"
      ).bind(email, otp, "verification").all();

      const otpRecord = otps?.[0] as any;
      if (!otpRecord) return errorResponse("Invalid verification code", 400);

      // Check expiry
      if (new Date(otpRecord.expires_at).getTime() < Date.now()) {
        return errorResponse("Verification code has expired. Please register again.", 400);
      }

      // Check if user already exists (from old flow)
      const { results: existingUser } = await context.env.DB.prepare(
        "SELECT id, name FROM users WHERE email = ?"
      ).bind(email).all();
      
      let userId;
      let userName;

      if (existingUser && existingUser.length > 0) {
          userId = existingUser[0].id;
          userName = existingUser[0].name;
          // Mark user as verified
          await context.env.DB.prepare(
            "UPDATE users SET is_verified = 1 WHERE email = ?"
          ).bind(email).run();
      } else {
          // New flow: create user now
          if (!password) {
              return errorResponse("Session expired. Please register again.", 400);
          }
          userId = crypto.randomUUID();
          userName = name || email.split('@')[0];
          const hashedPassword = hashPassword(password);
          await context.env.DB.prepare(
            "INSERT INTO users (id, name, email, password_hash, is_verified) VALUES (?, ?, ?, ?, 1)"
          ).bind(userId, userName, email, hashedPassword).run();
      }

      // Delete OTP
      await context.env.DB.prepare(
        "DELETE FROM otps WHERE email = ?"
      ).bind(email).run();

      const token = await generateToken({ id: userId, email }, context.env.JWT_SECRET || 'secret');

      return jsonResponse({
        success: true,
        message: "Email verified successfully",
        token,
        user: { id: userId, email, name: userName }
      });
    }

    if (url.pathname.endsWith('/login') && method === 'POST') {
      const body = await context.request.json() as any;
      const { email, password } = body;
      
      if (!email || !password) return errorResponse("Missing email or password", 400);

      const { results } = await context.env.DB.prepare(
        "SELECT * FROM users WHERE email = ?"
      ).bind(email).all();
      
      const user = results?.[0] as any;
      if (!user) return errorResponse("Invalid credentials", 401);
      
      if (user.password_hash && user.password_hash !== hashPassword(password)) {
        return errorResponse("Invalid credentials", 401);
      }
      
      if (!user.is_verified) {
        // Generate a new OTP code and send it
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
        
        await context.env.DB.prepare("DELETE FROM otps WHERE email = ?").bind(email).run();
        await context.env.DB.prepare(
          "INSERT INTO otps (id, email, otp_code, purpose, expires_at) VALUES (?, ?, ?, ?, ?)"
        ).bind(crypto.randomUUID(), email, otpCode, "verification", expiresAt).run();
        
        await sendOtpEmail(email, otpCode, "verification", context.env);
        
        return jsonResponse({
          success: false,
          requiresVerification: true,
          error: "Please verify your email address. A new code has been sent."
        });
      }

      const token = await generateToken({ id: user.id, email }, context.env.JWT_SECRET || 'secret');
      
      return jsonResponse({
        success: true,
        token,
        user: { id: user.id, email, name: user.name }
      });
    }

    if (url.pathname.endsWith('/forgot-password') && method === 'POST') {
      const body = await context.request.json() as any;
      const { email } = body;

      if (!email) return errorResponse("Missing email address", 400);

      // Check if user exists
      const { results: users } = await context.env.DB.prepare(
        "SELECT id FROM users WHERE email = ?"
      ).bind(email).all();
      const user = users?.[0];

      if (!user) {
        // Return success to prevent email verification probing attacks
        return jsonResponse({
          success: true,
          message: "If the email exists in our system, a reset code has been sent."
        });
      }

      // Generate OTP code
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

      await context.env.DB.prepare("DELETE FROM otps WHERE email = ?").bind(email).run();
      await context.env.DB.prepare(
        "INSERT INTO otps (id, email, otp_code, purpose, expires_at) VALUES (?, ?, ?, ?, ?)"
      ).bind(crypto.randomUUID(), email, otpCode, "reset_password", expiresAt).run();

      await sendOtpEmail(email, otpCode, "reset_password", context.env);

      return jsonResponse({
        success: true,
        message: "Password reset code sent."
      });
    }

    if (url.pathname.endsWith('/reset-password') && method === 'POST') {
      const body = await context.request.json() as any;
      const { email, otp, newPassword } = body;

      if (!email || !otp || !newPassword) {
        return errorResponse("Missing required fields", 400);
      }

      // Query OTP
      const { results: otps } = await context.env.DB.prepare(
        "SELECT * FROM otps WHERE email = ? AND otp_code = ? AND purpose = ? ORDER BY created_at DESC LIMIT 1"
      ).bind(email, otp, "reset_password").all();

      const otpRecord = otps?.[0] as any;
      if (!otpRecord) return errorResponse("Invalid or expired reset code", 400);

      // Check expiry
      if (new Date(otpRecord.expires_at).getTime() < Date.now()) {
        return errorResponse("Reset code has expired. Please request another one.", 400);
      }

      const hashedPassword = hashPassword(newPassword);
      
      // Update password and ensure user is marked verified
      await context.env.DB.prepare(
        "UPDATE users SET password_hash = ?, is_verified = 1 WHERE email = ?"
      ).bind(hashedPassword, email).run();

      // Delete OTP
      await context.env.DB.prepare(
        "DELETE FROM otps WHERE email = ?"
      ).bind(email).run();

      return jsonResponse({
        success: true,
        message: "Password has been reset successfully. You can now login."
      });
    }

    return errorResponse("Auth route not found", 404);
  } catch (error: any) {
    return errorResponse(`Auth handler error: ${error.message}`, 500);
  }
}
