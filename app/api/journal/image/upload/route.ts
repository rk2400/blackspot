import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';
import { withAuth, AuthRequest } from '@/lib/middleware';
 
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
 
async function handler(req: AuthRequest) {
  try {
    await connectDB();
    const owner = req.user?.userId || req.user?.email;
    if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 
    const form = await req.formData();
    const file = form.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
 
    const db = mongoose.connection.db;
    if (!db) return NextResponse.json({ error: 'Database not connected' }, { status: 500 });
 
    const { GridFSBucket } = await import('mongodb');
    const bucket = new GridFSBucket(db, { bucketName: 'journal_images' });
 
    const filename = (file as any).name || 'image';
    const contentType = file.type || 'application/octet-stream';
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
 
    const uploadStream = bucket.openUploadStream(filename, {
      contentType,
      metadata: { uploadedBy: owner, contentType },
    });
 
    await new Promise<void>((resolve, reject) => {
      uploadStream.on('finish', () => resolve());
      uploadStream.on('error', (e) => reject(e));
      uploadStream.end(buffer);
    });
 
    const id: any = (uploadStream as any).id;
    const hex = typeof id === 'object' && 'toHexString' in id ? id.toHexString() : String(id);
    const url = `/api/journal/image/${hex}`;
 
    return NextResponse.json({ url, id: hex }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Upload failed' }, { status: 500 });
  }
}
 
export const POST = withAuth(handler);
