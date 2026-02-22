import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import CommunityPost from '@/lib/models/CommunityPost';
import CommunityTopic from '@/lib/models/CommunityTopic';
import CommunityComment from '@/lib/models/CommunityComment';
import { withAuth, AuthRequest } from '@/lib/middleware';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const post = await CommunityPost.findById(params.id)
      .select('title content imageUrl author createdAt likes locked topic')
      .populate('author', 'name email')
      .lean();
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    const likeCount = Array.isArray(post.likes) ? post.likes.length : 0;
    let topic: any = null;
    if (post.topic) {
      const t = await CommunityTopic.findById(post.topic).select('title slug').lean();
      topic = t || null;
    }
    return NextResponse.json({ post, likeCount, topic }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

async function deleteHandler(req: AuthRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    if (!req.user?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const post = await CommunityPost.findById(params.id);
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    if (String(post.author) !== String(req.user.userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await CommunityComment.deleteMany({ post: post._id });
    await post.deleteOne();
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete post' }, { status: 400 });
  }
}

export const DELETE = withAuth(deleteHandler);
