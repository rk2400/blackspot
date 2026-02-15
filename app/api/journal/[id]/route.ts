 import { NextResponse } from 'next/server';
 import connectDB from '@/lib/db';
 import mongoose from 'mongoose';
 import { withAuth, AuthRequest } from '@/lib/middleware';
 import Journal from '@/lib/models/Journal';
 
 export const runtime = 'nodejs';
 export const dynamic = 'force-dynamic';
 
 async function deleteHandler(req: AuthRequest, { params }: { params: { id: string } }) {
   try {
     await connectDB();
     const owner = req.user?.userId || req.user?.email;
     if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     const id = params.id;
     if (!id || !mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
     const doc = await Journal.findById(id);
     if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
     if (doc.owner.toLowerCase() !== (owner || '').toLowerCase()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
     await Journal.deleteOne({ _id: id });
     return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } });
   } catch (error: any) {
     return NextResponse.json({ error: error?.message || 'Failed to delete' }, { status: 500 });
   }
 }
 
 async function patchHandler(req: AuthRequest, { params }: { params: { id: string } }) {
   try {
     await connectDB();
     const owner = req.user?.userId || req.user?.email;
     if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     const id = params.id;
     if (!id || !mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
     const doc = await Journal.findById(id);
     if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
     if (doc.owner.toLowerCase() !== (owner || '').toLowerCase()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
     const body = await req.json();
     const title = 'title' in body ? String(body.title || '').trim() : doc.title;
     const content = 'content' in body ? String(body.content || '').trim() : doc.content;
    const imageUrl = 'imageUrl' in body ? String(body.imageUrl || '').trim() : doc.imageUrl || '';
    await Journal.updateOne({ _id: id }, { $set: { title, content, imageUrl } });
     return NextResponse.json({ success: true });
   } catch (error: any) {
     return NextResponse.json({ error: error?.message || 'Failed to update' }, { status: 500 });
   }
 }
 
 export const DELETE = withAuth(deleteHandler);
 export const PATCH = withAuth(patchHandler);
