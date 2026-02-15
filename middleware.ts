import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Helper to decode JWT payload without verification (verification happens in API routes)
function decodeJwtPayload(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only run on admin routes, excluding login
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      const url = new URL('/admin/login', request.url);
      return NextResponse.redirect(url);
    }

    const payload = decodeJwtPayload(token);

    if (!payload) {
      const url = new URL('/admin/login', request.url);
      return NextResponse.redirect(url);
    }

    // Check if user is admin
    // Note: We need to match the logic in lib/middleware.ts and lib/config.ts
    // Since we can't import config easily in Edge if it uses process.env without type safety or other deps,
    // we'll rely on the payload structure.
    // The payload should have type: 'admin' OR email matching admin email.
    // Ideally we should check against ADMIN_EMAIL env var, checking process.env.ADMIN_EMAIL works in Middleware.
    
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@blackspot.local';
    const isAdmin = 
      (payload.email && payload.email.toLowerCase() === adminEmail.toLowerCase()) || 
      payload.type === 'admin';

    if (!isAdmin) {
      // If logged in but not admin, maybe redirect to home or show error?
      // For now, redirect to admin login is safer/simpler
      const url = new URL('/admin/login', request.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
