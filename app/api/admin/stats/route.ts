import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { withAdminAuth, AuthRequest } from '@/lib/middleware';
import CommunityTopic from '@/lib/models/CommunityTopic';
import CommunityPost from '@/lib/models/CommunityPost';
import CommunityComment from '@/lib/models/CommunityComment';
import User from '@/lib/models/User';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handler(req: AuthRequest) {
  try {
    await connectDB();
    const [topicCount, postCount, commentCount, userCount] = await Promise.all([
      CommunityTopic.countDocuments({}),
      CommunityPost.countDocuments({}),
      CommunityComment.countDocuments({}),
      User.countDocuments({}),
    ]);
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activeUsers = await User.countDocuments({ lastSeen: { $gte: since } });
    const likesAgg = await CommunityPost.aggregate([
      { $project: { likesCount: { $size: { $ifNull: ['$likes', []] } } } },
      { $group: { _id: null, totalLikes: { $sum: '$likesCount' } } },
    ]);
    const totalLikes = likesAgg[0]?.totalLikes || 0;
    const cadenceAgg = await CommunityPost.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: {
            y: { $year: '$createdAt' },
            m: { $month: '$createdAt' },
            d: { $dayOfMonth: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.y': 1, '_id.m': 1, '_id.d': 1 } },
    ]);

    return NextResponse.json(
      {
        topicCount,
        postCount,
        commentCount,
        userCount,
        activeUsers7d: activeUsers,
        totalLikes,
        cadence7d: cadenceAgg.map((c) => ({ date: `${c._id.y}-${String(c._id.m).padStart(2, '0')}-${String(c._id.d).padStart(2, '0')}`, count: c.count })),
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to load stats' }, { status: 500 });
  }
}

export const GET = withAdminAuth(handler);
