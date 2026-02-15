 import { NextResponse } from 'next/server';
 import connectDB from '@/lib/db';
 import { withAuth, AuthRequest } from '@/lib/middleware';
 import Affirmation from '@/lib/models/Affirmation';
 
 export const runtime = 'nodejs';
 export const dynamic = 'force-dynamic';
 
 async function handler(req: AuthRequest) {
   try {
     await connectDB();
     const owner = req.user?.userId || req.user?.email;
     if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     const body = await req.json();
     const modeRaw = (body?.mode || 'morning').toLowerCase();
     const mode = modeRaw === 'night' ? 'night' : 'morning';
     const text = String(body?.text || '').trim();
     if (!text) return NextResponse.json({ error: 'Text is required' }, { status: 400 });
 
     const doc = await Affirmation.create({ owner: (owner || '').toLowerCase(), mode, text });
     return NextResponse.json(
       { id: doc._id.toString(), text: doc.text, mode: doc.mode },
       { status: 201, headers: { 'Cache-Control': 'no-store' } }
     );
   } catch (error: any) {
     return NextResponse.json({ error: error?.message || 'Failed to add' }, { status: 500 });
   }
 }
 
 export const POST = withAuth(handler);
