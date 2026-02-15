 import { NextResponse } from 'next/server';
 import connectDB from '@/lib/db';
 import mongoose from 'mongoose';
 import { withAuth, AuthRequest } from '@/lib/middleware';
 import Affirmation from '@/lib/models/Affirmation';
 
 export const runtime = 'nodejs';
 export const dynamic = 'force-dynamic';
 
 async function deleteHandler(req: AuthRequest, { params }: { params: { id: string } }) {
   try {
     await connectDB();
     const owner = req.user?.userId || req.user?.email;
     if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     const id = params.id;
     if (!id || !mongoose.Types.ObjectId.isValid(id)) {
       return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
     }
     const doc = await Affirmation.findById(id);
     if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
     const isOwner = doc.owner.toLowerCase() === (owner || '').toLowerCase();
     if (!isOwner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
     await Affirmation.deleteOne({ _id: id });
     return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } });
   } catch (error: any) {
     return NextResponse.json({ error: error?.message || 'Failed to delete' }, { status: 500 });
   }
 }
 
 export const DELETE = withAuth(deleteHandler);
