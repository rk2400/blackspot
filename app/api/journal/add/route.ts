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
     const body = await req.json();
     const title = String(body?.title || '').trim();
     const content = String(body?.content || '').trim();
    const imageUrl = String(body?.imageUrl || '').trim();
     if (!content) return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    const doc = await Journal.create({ owner: (owner || '').toLowerCase(), title, content, imageUrl });
    return NextResponse.json({ id: doc._id.toString(), title: doc.title, content: doc.content, imageUrl: doc.imageUrl, createdAt: doc.createdAt }, { status: 201 });
   } catch (error: any) {
     return NextResponse.json({ error: error?.message || 'Failed to add' }, { status: 500 });
   }
 }
 
 export const POST = withAuth(handler);
