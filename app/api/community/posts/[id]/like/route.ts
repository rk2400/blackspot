import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { withAuth, AuthRequest } from '@/lib/middleware';
import CommunityPost from '@/lib/models/CommunityPost';
import mongoose from 'mongoose';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function postHandler(req: AuthRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    if (!req.user?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const post = await CommunityPost.findById(params.id);
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    if (post.locked) return NextResponse.json({ error: 'Post is locked' }, { status: 403 });
    const uid = new mongoose.Types.ObjectId(req.user.userId);
    const has = post.likes.some((l) => String(l) === String(uid));
    if (has) {
      post.likes = post.likes.filter((l) => String(l) !== String(uid));
    } else {
      post.likes.push(uid);
    }
    await post.save();
    return NextResponse.json({ liked: !has, likeCount: post.likes.length });
  } catch {
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
  }
}

export const POST = withAuth(postHandler);

