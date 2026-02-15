import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { withAuth, AuthRequest } from '@/lib/middleware';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handler(req: AuthRequest) {
  try {
    await connectDB();
    let maxVideos = 3;
    const userId = req.user?.userId;
    const email = (req.user?.email || '').toLowerCase();
    // Prefer per-user limit first
    if (userId) {
      const user = await User.findById(userId).select('manifestMaxVideos');
      if (user && typeof user.manifestMaxVideos === 'number') {
        maxVideos = user.manifestMaxVideos;
      }
    } else if (email) {
      let byEmail = await User.findOne({ email }).select('manifestMaxVideos');
      if (!byEmail) {
        const escaped = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        byEmail = await User.findOne({ email: { $regex: `^${escaped}$`, $options: 'i' } }).select('manifestMaxVideos');
      }
      if (byEmail && typeof byEmail.manifestMaxVideos === 'number') {
        maxVideos = byEmail.manifestMaxVideos;
      }
    }
    // Fallback to global SiteSettings if no per-user value
    if (maxVideos === 3) {
      try {
        const { default: SiteSettings } = await import('@/lib/models/SiteSettings');
        const settings = await SiteSettings.findOne();
        if (settings && typeof settings.manifestMaxVideos === 'number') {
          maxVideos = settings.manifestMaxVideos;
        }
      } catch {}
    }
    return NextResponse.json({ maxVideos }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error: any) {
    return NextResponse.json({ maxVideos: 3 });
  }
}

export const GET = withAuth(handler);
