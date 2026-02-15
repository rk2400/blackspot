 import { NextRequest, NextResponse } from 'next/server';
 import connectDB from '@/lib/db';
 import mongoose from 'mongoose';
 import { withAuth, AuthRequest } from '@/lib/middleware';
 
 export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
 
 async function handler(req: AuthRequest) {
   try {
     await connectDB();
     const db = mongoose.connection.db;
     if (!db) {
       return NextResponse.json({ error: 'Database not connected' }, { status: 500 });
     }
     const { GridFSBucket } = await import('mongodb');
     const bucket = new GridFSBucket(db, { bucketName: 'manifest_videos' });
 
     const owner = req.user?.userId || req.user?.email;
     const cursor = bucket.find({ 'metadata.uploadedBy': owner });
     const files = await cursor.toArray();
 
    const items = files.map((f: any) => ({
       id: typeof f._id === 'object' && 'toHexString' in f._id ? f._id.toHexString() : String(f._id),
       filename: f.filename,
       length: f.length,
       uploadDate: f.uploadDate,
       contentType: f.contentType || (f.metadata && f.metadata.contentType) || 'video/webm',
      unlockAt: f.metadata?.unlockAt ? new Date(f.metadata.unlockAt) : undefined,
     }));
 
    return NextResponse.json(
      { items },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    );
   } catch (error: any) {
     console.error('Manifest list error:', error);
     return NextResponse.json({ error: error?.message || 'Failed to list' }, { status: 500 });
   }
 }
 
 export const GET = withAuth(handler);
