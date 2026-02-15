import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import OTP from '@/lib/models/OTP';
import { generateOTP } from '@/lib/auth';
import { emailService } from '@/lib/email';
import { loginSchema } from '@/lib/validations';
import { authConfig } from '@/lib/config';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { email } = loginSchema.parse(body);
    console.log('[auth/login] Incoming login request', { url: req.url, method: req.method });
    console.log('[auth/login] Headers:', Object.fromEntries(req.headers.entries()));
    console.log('[auth/login] Body:', { email });

    // Normalize email (lowercase and trim) - schema will also lowercase on save
    const normalizedEmail = email.toLowerCase().trim();

    // Find user - normally must exist for login (email is stored lowercase due to schema)
    const user = await User.findOne({ email: normalizedEmail });

    // If user not found but the email matches configured admin email, allow OTP generation
    // so admins can sign in via OTP even when no User document exists.
    if (!user) {
      const { adminConfig } = await import('@/lib/config');
      if (normalizedEmail !== adminConfig.email.toLowerCase()) {
        return NextResponse.json(
          { error: 'Account not found. Please create an account first.' },
          { status: 404 }
        );
      }

      // Ensure an Admin record exists; if missing, create it using ADMIN_PASSWORD
      const Admin = (await import('@/lib/models/Admin')).default;
      let admin = await Admin.findOne({ email: normalizedEmail });
      if (!admin) {
        console.log('[auth/login] Admin record missing for', normalizedEmail, '- creating using ADMIN_PASSWORD');
        const { hashPassword } = await import('@/lib/auth');
        const { adminConfig: cfg } = await import('@/lib/config');
        const passwordHash = await hashPassword(cfg.password);
        admin = await Admin.create({ email: normalizedEmail, passwordHash });
        console.log('[auth/login] Admin record created:', admin._id.toString());
      }
      // allow OTP generation for admin email even without user
    }

    // Block login if user account is locked
    if (user && user.locked) {
      return NextResponse.json(
        { error: 'Your account is locked. Please contact support to unlock.' },
        { status: 403 }
      );
    }

    // Generate OTP
    const code = generateOTP();
    console.log('[auth/login] Generated OTP for', normalizedEmail, code);
    const expiresAt = new Date(Date.now() + authConfig.otpExpiryMinutes * 60 * 1000);

    // Delete old OTPs for this email (use normalized email)
    await OTP.deleteMany({ email: normalizedEmail });

    // Create new OTP (use normalized email)
    await OTP.create({
      email: normalizedEmail,
      code,
      expiresAt,
      used: false,
    });

    // Send OTP email (use original email for display, normalized for storage)
    console.log('[auth/login] Sending OTP email to', normalizedEmail);
    const { appConfig, adminConfig } = await import('@/lib/config');
    const displayName =
      (user?.name && user.name.trim()) ||
      (normalizedEmail === adminConfig.email.toLowerCase() ? 'Admin' : normalizedEmail.split('@')[0]) ||
      'User';
    const sent = await emailService.sendUsingTemplate('LOGIN_OTP', normalizedEmail, {
      code,
      appName: appConfig.name,
      expiry: authConfig.otpExpiryMinutes,
      userName: displayName,
    });
    if (!sent) {
      return NextResponse.json(
        { error: 'Failed to send OTP email. Please try again later.' },
        { status: 500 }
      );
    }
    console.log('[auth/login] OTP email send attempted for', normalizedEmail);

    return NextResponse.json({
      success: true,
      message: 'OTP sent to your email',
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send OTP' },
      { status: 400 }
    );
  }
}
