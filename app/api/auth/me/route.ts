import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthRequest } from '@/lib/middleware';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import Admin from '@/lib/models/Admin';

async function handler(req: AuthRequest) {
  try {
    await connectDB();
    console.log('[auth/me] Request headers:', Object.fromEntries((req as any).headers?.entries ? req.headers.entries() : []));
    try {
      console.log('[auth/me] Cookies raw:', req.cookies);
    } catch (e: any) {
      console.log('[auth/me] Cookies unavailable', e?.message || e);
    }

    console.log('[auth/me] token payload on req.user:', req.user);
    if (!req.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // If token is admin type, return admin info so UI can treat admin as authenticated
    if (req.user.type === 'admin') {
      const admin = await Admin.findOne({ email: (req.user.email || '').toLowerCase() });
      if (!admin) {
        return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
      }

      return NextResponse.json({
        user: {
          id: admin._id,
          name: '',
          email: admin.email,
          phone: '',
          address: null,
          isAdmin: true,
        },
      });
    }

    if (req.user.type !== 'user' || !req.user.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is admin (via configured admin email)
    const { adminConfig } = await import('@/lib/config');
    const isAdmin = user.email.toLowerCase() === adminConfig.email.toLowerCase();

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name || '',
        email: user.email,
        phone: user.phone || '',
        bio: (user as any).bio || '',
        lastSeen: (user as any).lastSeen || null,
        interests: Array.isArray((user as any).interests) ? (user as any).interests : [],
        address: user.address
          ? {
              full: user.address.full || '',
              street: user.address.street || '',
              city: user.address.city || '',
              state: user.address.state || '',
              pincode: user.address.pincode || '',
            }
          : null,
        isAdmin,
      },
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler);
