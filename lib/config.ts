/**
 * Centralized configuration management
 * Validates environment variables and provides type-safe access
 */

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  
  if (!value && defaultValue === undefined) {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
      `Please set ${key} in your .env.local file.\n` +
      `See .env.example for all required variables.`
    );
  }
  
  return value || defaultValue!;
}

function getEnvVarAsNumber(key: string, defaultValue?: number): number {
  const value = getEnvVar(key, defaultValue?.toString());
  const num = parseInt(value, 10);
  
  if (isNaN(num)) {
    throw new Error(
      `Invalid number for environment variable: ${key}\n` +
      `Value "${value}" is not a valid number.`
    );
  }
  
  return num;
}

function getEnvVarAsBoolean(key: string, defaultValue?: boolean): boolean {
  const value = getEnvVar(key, defaultValue?.toString());
  return value.toLowerCase() === 'true';
}

// Database Configuration
export const dbConfig = {
  uri: getEnvVar('MONGODB_URI', 'mongodb://localhost:27017/blackspot'),
} as const;

// Authentication Configuration
export const authConfig = {
  jwtSecret: getEnvVar('JWT_SECRET', 'change-this-secret-in-production'),
  jwtExpiry: getEnvVar('JWT_EXPIRY', '7d'),
  otpExpiryMinutes: getEnvVarAsNumber('OTP_EXPIRY_MINUTES', 10),
  otpSecret: getEnvVar('OTP_SECRET', 'change-this-otp-secret-in-production'),
} as const;

// Admin Configuration
export const adminConfig = {
  email: getEnvVar('ADMIN_EMAIL', 'admin@blackspot.local'),
  password: getEnvVar('ADMIN_PASSWORD', 'ChangeThisPassword123!'),
} as const;

// Email Configuration
export const emailConfig = {
  host: getEnvVar('EMAIL_HOST', ''),
  port: getEnvVarAsNumber('EMAIL_PORT', 587),
  user: getEnvVar('EMAIL_USER', ''),
  pass: getEnvVar('EMAIL_PASS', ''),
  from: getEnvVar('EMAIL_FROM', 'noreply@blackspot.local'),
  secure: getEnvVarAsBoolean('EMAIL_SECURE', false),
  // Check if email is configured (all required fields present)
  isConfigured: (): boolean => {
    return !!(
      process.env.EMAIL_HOST &&
      process.env.EMAIL_USER &&
      process.env.EMAIL_PASS
    );
  },
} as const;

// App Configuration
export const appConfig = {
  name: getEnvVar('APP_NAME', 'The BlackSpot Project'),
  url: getEnvVar('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
  nodeEnv: getEnvVar('NODE_ENV', 'development'),
  isProduction: (): boolean => {
    return process.env.NODE_ENV === 'production';
  },
  isDevelopment: (): boolean => {
    return process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
  },
} as const;

// Payment Configuration
export const paymentConfig = {
  merchantId: getEnvVar('UPI_MERCHANT_ID', 'mock_merchant_123'),
  testMode: getEnvVarAsBoolean('UPI_TEST_MODE', true),
  // UPI Configuration
  upiId: getEnvVar('NEXT_PUBLIC_UPI_ID', 'merchant@upi'),
  upiPayeeName: getEnvVar('NEXT_PUBLIC_UPI_PAYEE_NAME', 'The BlackSpot Project'),
  // Future: Add Razorpay/Cashfree keys here
  razorpayKeyId: getEnvVar('RAZORPAY_KEY_ID', ''),
  razorpayKeySecret: getEnvVar('RAZORPAY_KEY_SECRET', ''),
  cashfreeAppId: getEnvVar('CASHFREE_APP_ID', ''),
  cashfreeSecretKey: getEnvVar('CASHFREE_SECRET_KEY', ''),
} as const;

// Validate critical configuration on import
if (appConfig.isProduction()) {
  // In production, ensure critical secrets are not defaults
  if (authConfig.jwtSecret === 'change-this-secret-in-production') {
    throw new Error(
      'JWT_SECRET must be set to a secure value in production.\n' +
      'Generate a strong secret: openssl rand -base64 32'
    );
  }
  
  if (authConfig.otpSecret === 'change-this-otp-secret-in-production') {
    throw new Error(
      'OTP_SECRET must be set to a secure value in production.\n' +
      'Generate a strong secret: openssl rand -base64 32'
    );
  }
  
  if (dbConfig.uri.includes('localhost')) {
    console.warn(
      '⚠️  WARNING: Using localhost MongoDB URI in production.\n' +
      'This should be a production MongoDB connection string.'
    );
  }
}

// Export all configs
export const config = {
  db: dbConfig,
  auth: authConfig,
  admin: adminConfig,
  email: emailConfig,
  app: appConfig,
  payment: paymentConfig,
} as const;

export default config;



