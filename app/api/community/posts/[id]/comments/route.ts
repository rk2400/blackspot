import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { withAuth, AuthRequest } from '@/lib/middleware';
import CommunityPost from '@/lib/models/CommunityPost';
import CommunityComment from '@/lib/models/CommunityComment';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const createSchema = z.object({
  content: z.string().min(1).max(4000),
});

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const post = await CommunityPost.findById(params.id).select('_id').lean();
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    const comments = await CommunityComment.find({ post: post._id })
      .select('content author createdAt')
      .populate('author', 'name email')
      .sort({ createdAt: 1 })
      .lean();
    return NextResponse.json({ comments }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

async function postHandler(req: AuthRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    if (!req.user?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const post = await CommunityPost.findById(params.id).select('_id locked');
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    if (post.locked) return NextResponse.json({ error: 'Post is locked' }, { status: 403 });
    const body = await req.json();
    const { content } = createSchema.parse(body);
    const comment = await CommunityComment.create({
      post: post._id,
      author: req.user.userId,
      content: content.trim(),
    });
    return NextResponse.json({ comment });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to add comment' }, { status: 400 });
  }
}

export const POST = withAuth(postHandler);
