import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const db = mongoose.connection.db;
    if (!db) return NextResponse.json({ error: 'Database not connected' }, { status: 500 });

    const { GridFSBucket, ObjectId } = await import('mongodb');
    const bucket = new GridFSBucket(db, { bucketName: 'community_images' });
    let oid: any;
    try {
      oid = new ObjectId(params.id);
    } catch {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const files = await bucket.find({ _id: oid }).toArray();
    if (!files.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const file = files[0] as any;

    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      bucket.openDownloadStream(oid)
        .on('data', (d: Buffer) => chunks.push(d))
        .on('error', reject)
        .on('end', () => resolve());
    });

    const blob = Buffer.concat(chunks);
    const res = new NextResponse(blob, { status: 200 });
    res.headers.set('Content-Type', file.contentType || file.metadata?.contentType || 'image/jpeg');
    res.headers.set('Cache-Control', 'no-store, private, max-age=0');
    return res;
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to load image' }, { status: 500 });
  }
}
