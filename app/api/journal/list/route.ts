 import { NextResponse } from 'next/server';
 import connectDB from '@/lib/db';
 import { withAuth, AuthRequest } from '@/lib/middleware';
 import Journal from '@/lib/models/Journal';
 
 export const runtime = 'nodejs';
 export const dynamic = 'force-dynamic';
 
 async function handler(req: AuthRequest) {
   try {
     await connectDB();
     const owner = req.user?.userId || req.user?.email;
     if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     const items = await Journal.find({ owner: (owner || '').toLowerCase() }).sort({ createdAt: -1 }).lean();
    return NextResponse.json(
      { items: items.map((i: any) => ({ id: i._id.toString(), title: i.title, content: i.content, imageUrl: i.imageUrl || '', createdAt: i.createdAt })) },
      { headers: { 'Cache-Control': 'no-store' } }
    );
   } catch (error: any) {
     return NextResponse.json({ error: error?.message || 'Failed to list' }, { status: 500 });
   }
 }
 
 export const GET = withAuth(handler);
