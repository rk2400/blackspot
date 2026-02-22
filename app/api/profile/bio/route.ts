import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { withAuth, AuthRequest } from '@/lib/middleware';
import User from '@/lib/models/User';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  bio: z.string().max(1000),
});

async function handler(req: AuthRequest) {
  try {
    await connectDB();
    if (!req.user?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const { bio } = schema.parse(body);
    await User.updateOne({ _id: req.user.userId }, { $set: { bio: bio.trim(), lastSeen: new Date() } });
    return NextResponse.json({ bio: bio.trim() }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update bio' }, { status: 400 });
  }
}

export const POST = withAuth(handler);
