import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { withAdminAuth } from '@/lib/middleware';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withAdminAuth(async (req) => {
  try {
    await connectDB();

    const users = await User.find()
      .select('name email phone createdAt locked manifestMaxVideos')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ users }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error: any) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
});



