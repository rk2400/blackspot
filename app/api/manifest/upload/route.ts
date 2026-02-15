import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';
import { withAuth, AuthRequest } from '@/lib/middleware';
import { scheduleUnlockNotification } from '@/lib/manifestUnlockScheduler';
 
export const runtime = 'nodejs';
 
async function handler(req: AuthRequest) {
  try {
    await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 500 });
    }
 
    const form = await req.formData();
    const file = form.get('file');
    const contentType = (form.get('contentType') as string) || 'application/octet-stream';
    const unlockAtRaw = (form.get('unlockAt') as string) || '';
 
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
 
    // Determine limit: prefer global SiteSettings, fallback to per-user
    const owner = req.user?.userId || req.user?.email || 'unknown';
    const filesCol = db.collection('manifest_videos.files');
    const existingCount = await filesCol.countDocuments({ 'metadata.uploadedBy': owner });
    let maxVideos = 3;
    const { default: User } = await import('@/lib/models/User');
    // Prefer per-user limit first
    if (req.user?.userId) {
      const doc = await User.findById(req.user.userId).select('manifestMaxVideos');
      if (doc && typeof (doc as any).manifestMaxVideos === 'number') {
        maxVideos = (doc as any).manifestMaxVideos;
      }
    }
    // Fallback by email for sessions without a userId (e.g., admin or legacy tokens)
    if (maxVideos === 3 && req.user?.email) {
      const raw = String(req.user.email || '');
      const normalized = raw.toLowerCase();
      let docByEmail = await User.findOne({ email: normalized }).select('manifestMaxVideos');
      if (!docByEmail && raw) {
        const escaped = raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        docByEmail = await User.findOne({ email: { $regex: `^${escaped}$`, $options: 'i' } }).select('manifestMaxVideos');
      }
      if (docByEmail && typeof (docByEmail as any).manifestMaxVideos === 'number') {
        maxVideos = (docByEmail as any).manifestMaxVideos;
      }
    }
    // Finally, fallback to global SiteSettings if no per-user value
    if (maxVideos === 3) {
      try {
        const { default: SiteSettings } = await import('@/lib/models/SiteSettings');
        const settings = await SiteSettings.findOne();
        if (settings && typeof (settings as any).manifestMaxVideos === 'number') {
          maxVideos = (settings as any).manifestMaxVideos;
        }
      } catch {}
    }
    if (existingCount >= maxVideos) {
      return NextResponse.json({ error: `Limit reached: You can only have ${maxVideos} Manifest videos` }, { status: 403 });
    }

    const filename = (file as File).name || `manifest_${Date.now()}.webm`;
    const size = (file as File).size;
 
    const { GridFSBucket, ObjectId } = await import('mongodb');
    const bucket = new GridFSBucket(db, { bucketName: 'manifest_videos' });
 
    // Normalize and enforce future unlockAt
    let parsedUnlock: Date | undefined = undefined;
    try {
      const d = new Date(unlockAtRaw);
      if (!isNaN(d.getTime())) {
        parsedUnlock = d;
      }
    } catch {}
    if (!parsedUnlock) {
      const d = new Date();
      d.setMonth(d.getMonth() + 1);
      parsedUnlock = d;
    }
    if (parsedUnlock.getTime() <= Date.now()) {
      const d = new Date();
      d.setMonth(d.getMonth() + 1);
      parsedUnlock = d;
    }

    const uploadStream = bucket.openUploadStream(filename, {
      contentType,
      metadata: {
        size,
        uploadedAt: new Date(),
        source: 'manifest',
        uploadedBy: req.user?.userId || req.user?.email || 'unknown',
        uploadedByEmail: req.user?.email || '',
        unlockAt: parsedUnlock,
      },
    });
 
    const arrayBuffer = await (file as File).arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await new Promise<void>((resolve, reject) => {
      uploadStream.end(buffer, (err?: Error | null) => {
        if (err) reject(err);
        else resolve();
      });
    });
 
    const id = uploadStream.id instanceof ObjectId ? uploadStream.id.toHexString() : String(uploadStream.id);
    try {
      scheduleUnlockNotification(id, parsedUnlock, req.user?.email || '');
    } catch {}
    return NextResponse.json({ id, filename });
  } catch (error: any) {
    console.error('Manifest upload error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to upload' }, { status: 500 });
  }
 }

export const POST = withAuth(handler);
