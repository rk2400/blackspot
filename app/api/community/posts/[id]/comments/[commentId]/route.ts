import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { withAuth, AuthRequest } from '@/lib/middleware';
import CommunityPost from '@/lib/models/CommunityPost';
import CommunityComment from '@/lib/models/CommunityComment';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function deleteHandler(req: AuthRequest, { params }: { params: { id: string, commentId: string } }) {
  try {
    await connectDB();
    if (!req.user?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const post = await CommunityPost.findById(params.id).select('_id');
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    const comment = await CommunityComment.findById(params.commentId);
    if (!comment || String(comment.post) !== String(post._id)) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }
    if (String(comment.author) !== String(req.user.userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await comment.deleteOne();
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete comment' }, { status: 400 });
  }
}

export const DELETE = withAuth(deleteHandler);

