import { NextRequest, NextResponse } from 'next/server';
 import connectDB from '@/lib/db';
 import mongoose from 'mongoose';
 import { withAuth, AuthRequest } from '@/lib/middleware';
 
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
 
async function getHandler(req: AuthRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const db = mongoose.connection.db;
  if (!db) {
    return NextResponse.json({ error: 'Database not connected' }, { status: 500 });
  }
  const { GridFSBucket, ObjectId } = await import('mongodb');
  const bucket = new GridFSBucket(db, { bucketName: 'manifest_videos' });
  const id = new ObjectId(params.id);

  const files = await bucket.find({ _id: id }).toArray();
  if (!files.length) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const file = files[0] as any;
  const owner = req.user?.userId || req.user?.email;
  const { adminConfig } = await import('@/lib/config');
  const isAdmin = (req.user?.email || '').toLowerCase() === adminConfig.email.toLowerCase() || req.user?.type === 'admin';
  if (!isAdmin && file.metadata?.uploadedBy !== owner) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (file.metadata?.unlockAt) {
    const unlockDate = new Date(file.metadata.unlockAt);
    if (!isNaN(unlockDate.getTime()) && Date.now() < unlockDate.getTime()) {
      return NextResponse.json({ error: 'Locked until ' + unlockDate.toISOString() }, { status: 403 });
    }
  }

  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    bucket.openDownloadStream(id)
      .on('data', (d: Buffer) => chunks.push(d))
      .on('error', reject)
      .on('end', () => resolve());
  });

  const blob = Buffer.concat(chunks);
  const res = new NextResponse(blob, { status: 200 });
  res.headers.set('Content-Type', 'video/webm');
  res.headers.set('Cache-Control', 'no-store, private, max-age=0');
  return res;
}
 
 async function deleteHandler(req: AuthRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const db = mongoose.connection.db;
  if (!db) {
    return NextResponse.json({ error: 'Database not connected' }, { status: 500 });
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
 
  await bucket.delete(id);
 
  return NextResponse.json({ success: true });
 }
 
export const GET = withAuth(getHandler);
 export const DELETE = withAuth(deleteHandler);
