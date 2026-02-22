import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { withAuth, AuthRequest } from '@/lib/middleware';
import CommunityPost from '@/lib/models/CommunityPost';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handler(req: AuthRequest) {
  try {
    await connectDB();
    const userId = req.user?.userId;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const posts = await CommunityPost.find({ author: userId })
      .select('title createdAt topic')
      .populate('topic', 'title slug')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    return NextResponse.json({ posts }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to load activity' }, { status: 500 });
  }
}

export const GET = withAuth(handler);
