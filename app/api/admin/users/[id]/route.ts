import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { withAdminAuth, AuthRequest } from '@/lib/middleware';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const updateSchema = z.object({
  locked: z.boolean().optional(),
  manifestMaxVideos: z.coerce.number().min(1).max(50).optional(),
}).refine((data) => data.locked !== undefined || data.manifestMaxVideos !== undefined, {
  message: 'Provide at least one field to update',
});

async function handler(req: AuthRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    if (req.method === 'PUT') {
      const body = await req.json();
      const data = updateSchema.parse(body);

      const update: Record<string, any> = {};
      if (data.locked !== undefined) update.locked = data.locked;
      if (data.manifestMaxVideos !== undefined) update.manifestMaxVideos = Math.floor(data.manifestMaxVideos);

      const user = await User.findByIdAndUpdate(
        params.id,
        { $set: update },
        { new: true, runValidators: true }
      );

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      return NextResponse.json({ user }, { headers: { 'Cache-Control': 'no-store' } });
    }

    if (req.method === 'GET') {
      const user = await User.findById(params.id).select('name email phone createdAt locked manifestMaxVideos');
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({ user }, { headers: { 'Cache-Control': 'no-store' } });
    }

    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 400 }
    );
  }
}

export const GET = withAdminAuth(handler);
export const PUT = withAdminAuth(handler);
