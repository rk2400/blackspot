 import { NextResponse } from 'next/server';
 import connectDB from '@/lib/db';
 import { withAuth, AuthRequest } from '@/lib/middleware';
 import Mood from '@/lib/models/Mood';
 
 export const runtime = 'nodejs';
 export const dynamic = 'force-dynamic';
 
 async function handler(req: AuthRequest) {
   try {
     await connectDB();
     const owner = req.user?.userId || req.user?.email;
     if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     const body = await req.json();
     const scoreNum = Number(body?.score);
     const score = Math.max(1, Math.min(5, isNaN(scoreNum) ? 3 : scoreNum));
    const note = '';
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    const doc = await Mood.findOneAndUpdate(
      { owner: (owner || '').toLowerCase(), createdAt: { $gte: start, $lte: end } },
      { $set: { owner: (owner || '').toLowerCase(), score, note } },
      { upsert: true, new: true }
    );
    return NextResponse.json({ id: doc._id.toString(), score: doc.score, note: doc.note, createdAt: doc.createdAt }, { status: 201 });
   } catch (error: any) {
     return NextResponse.json({ error: error?.message || 'Failed to save mood' }, { status: 500 });
   }
 }
 
 export const POST = withAuth(handler);
