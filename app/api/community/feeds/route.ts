import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import CommunityPost from '@/lib/models/CommunityPost';
import CommunityComment from '@/lib/models/CommunityComment';
import { Types } from 'mongoose';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();

    const trending = await CommunityPost.find({})
      .select('title content imageUrl imageAlt imageCaption author createdAt likes')
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    const trendingSorted = [...trending].sort((a: any, b: any) => {
      const la = Array.isArray(a.likes) ? a.likes.length : 0;
      const lb = Array.isArray(b.likes) ? b.likes.length : 0;
      const ta = new Date(a.createdAt as any).getTime();
      const tb = new Date(b.createdAt as any).getTime();
      return lb - la || tb - ta;
    }).slice(0, 8);

    const mostDiscussedAgg = await CommunityComment.aggregate([
      { $group: { _id: '$post', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);
    const postIds = mostDiscussedAgg.map((d: any) => new Types.ObjectId(d._id));
    const discussedPosts = await CommunityPost.find({ _id: { $in: postIds } })
      .select('title content imageUrl imageAlt imageCaption author createdAt likes')
      .populate('author', 'name email')
      .lean();
    const discussedById: Record<string, any> = {};
    discussedPosts.forEach((p: any) => { discussedById[String(p._id)] = p; });
    const mostDiscussed = mostDiscussedAgg.map((d: any) => {
      const p = discussedById[String(d._id)];
      if (!p) return null;
      return { ...p, commentCount: d.count };
    }).filter(Boolean);

    return NextResponse.json({ trending: trendingSorted, mostDiscussed }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to load feeds' }, { status: 500 });
  }
}
