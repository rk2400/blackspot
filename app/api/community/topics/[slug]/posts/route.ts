import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { withAuth, AuthRequest } from '@/lib/middleware';
import CommunityTopic from '@/lib/models/CommunityTopic';
import CommunityPost from '@/lib/models/CommunityPost';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const createSchema = z
  .object({
    title: z.string().min(2).max(120),
    content: z.string().min(2).max(8000),
    imageUrl: z.string().max(1000).optional(),
    imageAlt: z.string().max(200).optional(),
    imageCaption: z.string().max(300).optional(),
  })
  .superRefine((val, ctx) => {
    const hasImage = !!String(val.imageUrl || '').trim();
    const hasAlt = !!String(val.imageAlt || '').trim();
    if (hasImage && !hasAlt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['imageAlt'],
        message: 'Alt text is required when an image is attached',
      });
    }
  });

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  try {
    await connectDB();
    const topic = await CommunityTopic.findOne({ slug: params.slug }).select('title slug imageUrl').lean();
    if (!topic) return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    const url = new URL(req.url);
    const page = Math.max(parseInt(url.searchParams.get('page') || '1', 10), 1);
    const limit = Math.max(parseInt(url.searchParams.get('limit') || '10', 10), 1);
    const skip = (page - 1) * limit;
    const total = await CommunityPost.countDocuments({ topic: topic._id });
    const posts = await CommunityPost.find({ topic: topic._id })
      .select('title content imageUrl author createdAt likes locked')
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    const hasMore = skip + posts.length < total;
    return NextResponse.json({ topic, posts, page, total, hasMore }, { headers: { 'Cache-Control': 'no-store' } });
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
    const { title, content, imageUrl, imageAlt, imageCaption } = createSchema.parse(body);
    const post = await CommunityPost.create({
      topic: topic._id,
      author: req.user.userId,
      title: title.trim(),
      content: content.trim(),
      imageUrl: String(imageUrl || '').trim(),
      imageAlt: String(imageAlt || '').trim(),
      imageCaption: String(imageCaption || '').trim(),
    });
    return NextResponse.json({ post });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create post' }, { status: 400 });
  }
}

export const POST = withAuth(postHandler);
