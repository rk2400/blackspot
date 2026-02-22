import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import CommunityTopic from '@/lib/models/CommunityTopic';
import CommunityPresence from '@/lib/models/CommunityPresence';
import User from '@/lib/models/User';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  try {
    await connectDB();
    const topic = await CommunityTopic.findOne({ slug: params.slug }).select('_id');
    if (!topic) return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    const presences = await CommunityPresence.find({ topic: topic._id })
      .select('user typing updatedAt')
      .lean();
    const users = await User.find({ _id: { $in: presences.map((p: any) => p.user) } })
      .select('name email lastSeen')
      .lean();
    const byId: Record<string, any> = {};
    users.forEach((u: any) => (byId[String(u._id)] = u));
    const items = presences.map((p: any) => {
      const u = byId[String(p.user)];
      const label = (u?.name?.trim() ? u?.name : u?.email) || '';
      return {
        userId: String(p.user),
        label,
        typing: !!p.typing,
        updatedAt: p.updatedAt,
        lastSeen: u?.lastSeen || null,
      };
    });
    return NextResponse.json({ items }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch presence' }, { status: 500 });
  }
}
