import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { withAuth, AuthRequest } from '@/lib/middleware';
import CommunityTopic from '@/lib/models/CommunityTopic';
import CommunityPost from '@/lib/models/CommunityPost';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const createSchema = z.object({
  title: z.string().min(2).max(120),
  content: z.string().min(2).max(4000),
  imageUrl: z.string().max(1000).optional(),
});

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  try {
    await connectDB();
    const topic = await CommunityTopic.findOne({ slug: params.slug }).select('title slug imageUrl').lean();
    if (!topic) return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    const posts = await CommunityPost.find({ topic: topic._id })
      .select('title content imageUrl author createdAt likes locked')
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ topic, posts }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

async function postHandler(req: AuthRequest, { params }: { params: { slug: string } }) {
  try {
    await connectDB();
    if (!req.user?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const topic = await CommunityTopic.findOne({ slug: params.slug });
    if (!topic) return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    const body = await req.json();
    const { title, content, imageUrl } = createSchema.parse(body);
    const post = await CommunityPost.create({
      topic: topic._id,
      author: req.user.userId,
      title: title.trim(),
      content: content.trim(),
      imageUrl: String(imageUrl || '').trim(),
    });
    return NextResponse.json({ post });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create post' }, { status: 400 });
  }
}

export const POST = withAuth(postHandler);
