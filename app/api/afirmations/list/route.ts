 import { NextRequest, NextResponse } from 'next/server';
 import connectDB from '@/lib/db';
 import mongoose from 'mongoose';
 import { withAuth, AuthRequest } from '@/lib/middleware';
 import Affirmation from '@/lib/models/Affirmation';
 
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
 
 async function handler(req: AuthRequest) {
   const url = new URL(req.url || '');
   const modeParam = (url.searchParams.get('mode') || 'morning').toLowerCase();
   const mode = modeParam === 'night' ? 'night' : 'morning';
   try {
     await connectDB();
     const owner = req.user?.userId || req.user?.email;
     if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 
    const finalItems = await Affirmation.find({ owner: (owner || '').toLowerCase(), mode }).sort({ createdAt: 1 }).lean();
 
     return NextResponse.json(
       {
         items: finalItems.map((i: any) => ({ id: i._id?.toString?.() || String(i._id), text: i.text, mode: i.mode })),
       },
       { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
     );
   } catch (error: any) {
     return NextResponse.json({ error: error?.message || 'Failed to list' }, { status: 500 });
   }
 }
 
 export const GET = withAuth(handler);
