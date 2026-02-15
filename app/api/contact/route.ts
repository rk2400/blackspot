import { NextRequest, NextResponse } from 'next/server';
import { contactSchema } from '@/lib/validations';
import { emailService } from '@/lib/email';
import { adminConfig, appConfig } from '@/lib/config';
import { z } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, message } = contactSchema.parse(body);

    // Send email notification to admin/support
    const supportEmail = process.env.SUPPORT_EMAIL || adminConfig.email;
    const emailSent = await emailService.sendUsingTemplate('CONTACT_NOTIFICATION', supportEmail, { userName: name, email, message }, email);

    // Send confirmation email to the user
    await emailService.sendUsingTemplate('CONTACT_CONFIRMATION', email, { userName: name, email, message, appName: appConfig.name });

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully. We\'ll get back to you soon!',
    });
  } catch (error: any) {
    console.error('Contact form error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message || 'Validation error' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}
