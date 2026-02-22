import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { id: string } }) {
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

    const stream = bucket.openDownloadStream(oid);
    const body = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk: Buffer) => controller.enqueue(chunk));
        stream.on('end', () => controller.close());
        stream.on('error', (err) => {
          try { controller.error(err); } catch {}
        });
      },
      cancel() {
        try { stream.destroy(); } catch {}
      },
    });

    const res = new NextResponse(body, { status: 200 });
    res.headers.set('Content-Type', file.contentType || file.metadata?.contentType || 'image/jpeg');
    res.headers.set('Cache-Control', 'public, max-age=86400, immutable');
    return res;
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to load image' }, { status: 500 });
  }
}
