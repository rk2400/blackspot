import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { withAuth, AuthRequest } from '@/lib/middleware';
import CommunityTopic from '@/lib/models/CommunityTopic';
import CommunityPost from '@/lib/models/CommunityPost';
import CommunityComment from '@/lib/models/CommunityComment';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function deleteHandler(req: AuthRequest, { params }: { params: { slug: string } }) {
  try {
    await connectDB();
    if (!req.user?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const topic = await CommunityTopic.findOne({ slug: params.slug });
    if (!topic) return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    if (String(topic.createdBy) !== String(req.user.userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const posts = await CommunityPost.find({ topic: topic._id }).select('_id').lean();
    const postIds = posts.map((p) => p._id);
    if (postIds.length > 0) {
      await CommunityComment.deleteMany({ post: { $in: postIds } });
      await CommunityPost.deleteMany({ _id: { $in: postIds } });
    }
    await topic.deleteOne();
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete topic' }, { status: 400 });
  }
}

export const DELETE = withAuth(deleteHandler);

