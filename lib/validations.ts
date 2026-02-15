import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const signupSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  email: z.string().email('Invalid email address'),
  phone: z.string()
    .regex(/^[6-9]\d{9}$/, 'Phone number must be 10 digits starting with 6, 7, 8, or 9')
    .length(10, 'Phone number must be exactly 10 digits'),
});

// Note: Admin authorization is based on ADMIN_EMAIL env variable
// Users with email matching ADMIN_EMAIL automatically get admin privileges

export const verifyOTPSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().length(6, 'OTP must be 6 digits'),
});

export const adminLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const emailTemplateSchema = z.object({
  type: z.enum(['ACCOUNT_WELCOME', 'LOGIN_OTP', 'NEWSLETTER_UPDATE', 'GENERIC_NOTIFICATION', 'CONTACT_CONFIRMATION', 'CONTACT_NOTIFICATION', 'MANIFEST_UNLOCK']),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Body is required'),
});

export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters').trim(),
});
