import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { withAuth, AuthRequest } from '@/lib/middleware';
import CommunityTopic from '@/lib/models/CommunityTopic';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const createSchema = z.object({
  title: z.string().min(2).max(80),
  description: z.string().max(500).optional(),
  imageUrl: z.string().max(1000).optional(),
});

function toSlug(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function GET() {
  try {
    await connectDB();
    const topics = await CommunityTopic.find()
      .select('title slug description imageUrl createdAt createdBy')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ topics }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch topics' }, { status: 500 });
  }
}

async function postHandler(req: AuthRequest) {
  try {
    await connectDB();
    if (!req.user?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const { title, description, imageUrl } = createSchema.parse(body);
    let base = toSlug(title);
    if (!base) base = 'topic';
    let slug = base;
    let i = 1;
    while (await CommunityTopic.findOne({ slug })) {
      slug = `${base}-${i++}`;
    }
    const topic = await CommunityTopic.create({
      title: title.trim(),
      slug,
      description: (description || '').trim(),
      imageUrl: String(imageUrl || '').trim(),
      createdBy: req.user.userId,
    });
    return NextResponse.json({ topic });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create topic' }, { status: 400 });
  }
}

export const POST = withAuth(postHandler);
