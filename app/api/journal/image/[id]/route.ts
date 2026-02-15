import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';
import { withAuth, AuthRequest } from '@/lib/middleware';
 
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
 
async function getHandler(req: AuthRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const owner = req.user?.userId || req.user?.email;
    if (!owner) return new Response('Unauthorized', { status: 401 });
 
    const db = mongoose.connection.db;
    if (!db) return new Response('Database not connected', { status: 500 });
 
    const { GridFSBucket, ObjectId } = await import('mongodb');
    const bucket = new GridFSBucket(db, { bucketName: 'journal_images' });
    let oid: any;
    try {
      oid = new ObjectId(params.id);
    } catch {
      return new Response('Invalid id', { status: 400 });
    }
 
    const files = await bucket.find({ _id: oid }).toArray();
    if (!files.length) return new Response('Not found', { status: 404 });
    const file = files[0] as any;
 
    const { adminConfig } = await import('@/lib/config');
    const isAdmin = (req.user?.email || '').toLowerCase() === adminConfig.email.toLowerCase() || req.user?.type === 'admin';
    if (!isAdmin && file.metadata?.uploadedBy !== owner) {
      return new Response('Forbidden', { status: 403 });
    }
 
    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      bucket.openDownloadStream(oid)
        .on('data', (d: Buffer) => chunks.push(d))
        .on('error', reject)
        .on('end', () => resolve());
    });
 
    const blob = Buffer.concat(chunks);
    return new Response(blob, {
      status: 200,
      headers: {
        'Content-Type': file.contentType || file.metadata?.contentType || 'image/jpeg',
        'Cache-Control': 'no-store, private, max-age=0',
      },
    });
  } catch (error: any) {
    return new Response(error?.message || 'Failed to load image', { status: 500 });
  }
}
 
export const GET = withAuth(getHandler);
