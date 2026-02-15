import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SiteSettings from '@/lib/models/SiteSettings';
import { withAdminAuth, AuthRequest } from '@/lib/middleware';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handler(req: AuthRequest) {
  try {
    await connectDB();

    if (req.method === 'GET') {
      let settings = await SiteSettings.findOne();
      if (!settings) {
        settings = await SiteSettings.create({});
      }
      return NextResponse.json({ maxVideos: settings.manifestMaxVideos });
    }

    if (req.method === 'PUT') {
      const body = await req.json();
      const raw = Number(body?.maxVideos);
      const value = Math.max(1, Math.min(50, isNaN(raw) ? 3 : raw));

      const settings = await SiteSettings.findOneAndUpdate(
        {},
        { $set: { manifestMaxVideos: value } },
        { new: true, upsert: true }
      );

      return NextResponse.json({ maxVideos: settings.manifestMaxVideos });
    }

    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to handle limit' }, { status: 500 });
  }
}

export const GET = withAdminAuth(handler);
export const PUT = withAdminAuth(handler);

