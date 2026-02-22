import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { signupSchema } from '@/lib/validations';
import { emailService } from '@/lib/email';
import { adminConfig, appConfig } from '@/lib/config';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { name, email, phone } = signupSchema.parse(body);

    // Normalize email (lowercase and trim) - schema will also lowercase on save
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists (email is stored lowercase due to schema)
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists. Please login instead.' },
        { status: 409 }
      );
    }

    // Create new user with normalized email
    try {
      const user = await User.create({ 
        name: name.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        verified: false 
      });

      try {
        const subject = 'New user registered';
        const html = `
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td align="center" style="padding:16px 12px;">
                <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;">
                  <tr>
                    <td style="padding:8px 24px;text-align:center;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,'Helvetica Neue',Arial,sans-serif;color:#111;">
                      <img src="https://png.pngtree.com/png-clipart/20230928/original/pngtree-yoga-logo-icon-design-spiritual-silhouette-pose-vector-png-image_12898165.png" alt="Spiritual icon" width="96" style="display:block;margin:12px auto;">
                      <div style="margin:6px 0 16px 0;font-size:14px;">${appConfig.name}</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 24px 24px 24px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,'Helvetica Neue',Arial,sans-serif;color:#111;">
                      <h2 style="margin:0 0 8px 0;font-size:22px;line-height:30px;">New user registered</h2>
                      <p style="margin:0;font-size:15px;line-height:22px;"><strong>Name:</strong> ${user.name || ''}</p>
                      <p style="margin:4px 0 0 0;font-size:15px;line-height:22px;"><strong>Email:</strong> ${user.email}</p>
                      <p style="margin:4px 0 0 0;font-size:15px;line-height:22px;"><strong>Phone:</strong> ${user.phone || ''}</p>
                      <p style="margin:12px 0 0 0;font-size:13px;line-height:20px;">Registered at: <strong>${new Date().toISOString()}</strong></p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        `;
        await emailService.sendEmail({ to: adminConfig.email, subject, html });
      } catch {}

      return NextResponse.json({
        success: true,
        message: 'Account created successfully. Please login to continue.',
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
      });
    } catch (err: any) {
      // Defensive duplicate-key handling (race conditions)
      if (err?.code === 11000) {
        return NextResponse.json(
          { error: 'Email already exists. Please login instead.' },
          { status: 409 }
        );
      }

      console.error('Signup DB error:', err);
      return NextResponse.json(
        { error: 'Failed to create account' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create account' },
      { status: 400 }
    );
  }
}
