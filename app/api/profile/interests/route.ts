import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { withAuth, AuthRequest } from '@/lib/middleware';
import { z } from 'zod';

const ALLOWED = [
  'Meditation',
  'Breathwork',
  'Yoga',
  'Mindfulness',
  'Affirmations',
  'Journaling',
  'Spirituality',
  'Nature',
  'Art',
  'Music',
  'Gratitude',
  'Community',
] as const;

const interestsUpdateSchema = z.object({
  interests: z.array(z.string()).max(20).optional(),
});

async function handler(req: AuthRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    await connectDB();
    if (!req.user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = interestsUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    const selected = (parsed.data.interests || [])
      .filter((i) => typeof i === 'string')
      .map((i) => i.trim())
      .filter((i) => i.length > 0);

    const normalizedSet = new Set<string>();
    for (const i of selected) {
      const match = ALLOWED.find((a) => a.toLowerCase() === i.toLowerCase());
      if (match) normalizedSet.add(match);
    }

    const updatedInterests = Array.from(normalizedSet);

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: { interests: updatedInterests } },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, interests: user.interests || [] });
  } catch (error: any) {
    console.error('Update interests error:', error);
    return NextResponse.json({ error: 'Failed to update interests' }, { status: 500 });
  }
}

export const POST = withAuth(handler);

