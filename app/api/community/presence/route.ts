import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { withAuth, AuthRequest } from '@/lib/middleware';
import CommunityTopic from '@/lib/models/CommunityTopic';
import CommunityPresence from '@/lib/models/CommunityPresence';
import User from '@/lib/models/User';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const presenceSchema = z.object({
  slug: z.string().min(1).max(120),
  typing: z.boolean().optional(),
});

async function handler(req: AuthRequest) {
  try {
    await connectDB();
    if (!req.user?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const { slug, typing = false } = presenceSchema.parse(body);
    const topic = await CommunityTopic.findOne({ slug }).select('_id');
    if (!topic) return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    await CommunityPresence.updateOne(
      { topic: topic._id, user: req.user.userId },
      { $set: { typing: !!typing, updatedAt: new Date() } },
      { upsert: true }
    );
    await User.updateOne({ _id: req.user.userId }, { $set: { lastSeen: new Date() } });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update presence' }, { status: 400 });
  }
}

export const POST = withAuth(handler);
