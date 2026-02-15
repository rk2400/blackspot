import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';
import { emailService } from '@/lib/email';
import { appConfig } from '@/lib/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const secret = process.env.CRON_SECRET || '';
    const headerSecret = req.headers.get('x-cron-secret') || '';
    const querySecret = new URL(req.url).searchParams.get('secret') || '';

    if (!secret || (headerSecret !== secret && querySecret !== secret)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 500 });
    }

    const filesCol = db.collection('manifest_videos.files');
    const now = new Date();

    const pending = await filesCol
      .find({
        'metadata.unlockAt': { $lte: now },
        $or: [
          { 'metadata.unlockNotifiedAt': { $exists: false } },
          { 'metadata.unlockNotifiedAt': null },
        ],
      })
      .toArray();

    let sentCount = 0;
    for (const f of pending as any[]) {
      const to = f.metadata?.uploadedByEmail || '';
      if (to) {
        const unlockDateStr = new Date(f.metadata?.unlockAt || Date.now()).toLocaleString();
        const uploadDateStr = new Date(f.metadata?.uploadedAt || Date.now()).toLocaleString();
        const sent = await emailService.sendUsingTemplate('MANIFEST_UNLOCK', to, {
          unlockDate: unlockDateStr,
          filename: f.filename,
          uploadDate: uploadDateStr,
          appName: appConfig.name,
          appUrl: appConfig.url,
        });
        if (!sent) {
          await emailService.sendEmail({
            to,
            subject: 'Automated Reminder that you have a video that is unlocked',
            html: `
              <h2>Your Manifest video is unlocked</h2>
              <p>Kindly visit us to check what you saved on <strong>${unlockDateStr}</strong>.</p>
              <p><strong>Video:</strong> ${f.filename}</p>
              <p><strong>Saved on:</strong> ${uploadDateStr}</p>
              <p>You might be receiving this after a long time. To help you remember everything, we’ve included the original save date and the video name.</p>
              <p><a href="${appConfig.url}">Open ${appConfig.name}</a> to view your video.</p>
            `,
          });
        }
      }
      await filesCol.updateOne(
        { _id: f._id },
        { $set: { 'metadata.unlockNotifiedAt': now } }
      );
      sentCount++;
    }

    return NextResponse.json({ success: true, checked: pending.length, sent: sentCount, at: now.toISOString() });
  } catch (error: any) {
    console.error('Cron manifest unlocks error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to process unlock notifications' }, { status: 500 });
  }
}
