// import nodemailer from 'nodemailer'; // Incompatible with Cloudflare Workers Edge runtime

export async function sendOtpEmail(
  to: string,
  otp: string,
  purpose: 'verification' | 'reset_password',
  env: any
): Promise<void> {
  const host = env.VITE_SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(env.VITE_SMTP_PORT || '465', 10);
  const user = env.VITE_SMTP_USER;
  const pass = env.VITE_SMTP_PASS;
  // const secure = env.VITE_SMTP_SECURE === 'true' || port === 465;

  if (!user || !pass) {
    console.warn("SMTP credentials not configured in environment. Mocking email sending.");
    console.log(`[MOCK EMAIL] To: ${to} | OTP: ${otp} | Purpose: ${purpose}`);
    return;
  }

  // Cloudflare Workers (where Pages Functions run) do not support Node.js raw TCP sockets 
  // via the standard 'net' and 'tls' modules out-of-the-box in a way that nodemailer expects.
  // To send emails from Cloudflare Workers, you should use an HTTP-based API provider 
  // like Resend, SendGrid, Mailgun, or MailChannels.
  
  console.warn("Notice: nodemailer is disabled. Cloudflare Workers require HTTP-based email APIs.");
  console.log(`[MOCK EMAIL] To: ${to} | OTP: ${otp} | Purpose: ${purpose}`);

  const subject = purpose === 'verification' 
    ? 'LifeSolver - Verify Your Email'
    : 'LifeSolver - Reset Your Password';

  const body = purpose === 'verification'
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

  // await transporter.sendMail({
  //   from: `"LifeSolver" <${user}>`,
  //   to,
  //   subject,
  //   html: body,
  // });
}
