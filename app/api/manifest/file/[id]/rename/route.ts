 import { NextRequest, NextResponse } from 'next/server';
 import connectDB from '@/lib/db';
 import mongoose from 'mongoose';
 import { withAuth, AuthRequest } from '@/lib/middleware';
 
 export const runtime = 'nodejs';
 
 async function handler(req: AuthRequest, { params }: { params: { id: string } }) {
   try {
     await connectDB();
     const db = mongoose.connection.db;
     if (!db) {
       return NextResponse.json({ error: 'Database not connected' }, { status: 500 });
     }
     const body = await req.json();
     const filename = String(body?.filename || '').trim();
     if (!filename) {
       return NextResponse.json({ error: 'Filename required' }, { status: 400 });
     }
 
     const { GridFSBucket, ObjectId } = await import('mongodb');
     const bucket = new GridFSBucket(db, { bucketName: 'manifest_videos' });
     let id: any;
     try {
       id = new ObjectId(params.id);
     } catch {
       return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
     }
 
     const files = await bucket.find({ _id: id }).toArray();
     if (!files.length) {
       return NextResponse.json({ error: 'File not found' }, { status: 404 });
     }
     const file = files[0] as any;
     const owner = req.user?.userId || req.user?.email;
     const { adminConfig } = await import('@/lib/config');
     const isAdmin = (req.user?.email || '').toLowerCase() === adminConfig.email.toLowerCase() || req.user?.type === 'admin';
     if (!isAdmin && file.metadata?.uploadedBy !== owner) {
       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
     }
 
     try {
       // @ts-ignore
       await bucket.rename(id, filename);
     } catch {
       const filesColl = db.collection('manifest_videos.files');
       await filesColl.updateOne({ _id: id }, { $set: { filename } });
     }
 
     return NextResponse.json({ success: true, filename });
   } catch (error: any) {
     return NextResponse.json({ error: error?.message || 'Failed to rename' }, { status: 500 });
   }
 }
 
 export const PATCH = withAuth(handler);
