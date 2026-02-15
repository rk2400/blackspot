import mongoose from 'mongoose';
import connectDB from './db';
import { emailService } from './email';
import { appConfig } from './config';

type TimerEntry = {
  id: string;
  timeout: NodeJS.Timeout;
};

let initialized = false;
const timers = new Map<string, TimerEntry>();

function schedule(id: string, when: Date, to: string) {
  const delay = when.getTime() - Date.now();
  if (isNaN(delay) || delay <= 0) return;
  if (timers.has(id)) return;
  const timeout = setTimeout(async () => {
    try {
      await connectDB();
      const db = mongoose.connection.db;
      if (!db) return;
      const col = db.collection('manifest_videos.files');
      const file = await col.findOne({ _id: new mongoose.Types.ObjectId(id) });
      if (!file) return;
      if (file.metadata?.unlockNotifiedAt) return;
      const unlockMeta = file.metadata?.unlockAt ? new Date(file.metadata.unlockAt) : null;
      if (unlockMeta && !isNaN(unlockMeta.getTime()) && Date.now() < unlockMeta.getTime()) {
        schedule(id, unlockMeta, file.metadata?.uploadedByEmail || '');
        return;
      }
      const email = to || file.metadata?.uploadedByEmail || '';
      const unlockDateStr = new Date(file.metadata?.unlockAt || Date.now()).toLocaleString();
      const uploadDateStr = new Date(file.metadata?.uploadedAt || Date.now()).toLocaleString();
      if (email) {
        const sent = await emailService.sendUsingTemplate('MANIFEST_UNLOCK', email, {
          unlockDate: unlockDateStr,
          filename: file.filename,
          uploadDate: uploadDateStr,
          appName: appConfig.name,
          appUrl: appConfig.url,
        });
        if (!sent) {
          await emailService.sendEmail({
            to: email,
            subject: 'Automated Reminder that you have a video that is unlocked',
            html: `
              <h2>Your Manifest video is unlocked</h2>
              <p>Kindly visit us to check what you saved on <strong>${unlockDateStr}</strong>.</p>
              <p><strong>Video:</strong> ${file.filename}</p>
              <p><strong>Saved on:</strong> ${uploadDateStr}</p>
              <p>You might be receiving this after a long time. To help you remember everything, we’ve included the original save date and the video name.</p>
              <p><a href="${appConfig.url}">Open ${appConfig.name}</a> to view your video.</p>
            `,
          });
        }
      }
      await col.updateOne(
        { _id: file._id },
        { $set: { 'metadata.unlockNotifiedAt': new Date() } }
      );
    } finally {
      timers.delete(id);
    }
  }, delay);
  timers.set(id, { id, timeout });
}

export async function initOnce() {
  if (initialized) return;
  initialized = true;
  await connectDB();
  const db = mongoose.connection.db;
  if (!db) return;
  const col = db.collection('manifest_videos.files');
  const now = new Date();
  const cursor = col.find({
    'metadata.unlockAt': { $gt: now },
    $or: [
      { 'metadata.unlockNotifiedAt': { $exists: false } },
      { 'metadata.unlockNotifiedAt': null },
    ],
  });
  const items = await cursor.toArray();
  for (const f of items as any[]) {
    const unlockAt = new Date(f.metadata.unlockAt);
    if (isNaN(unlockAt.getTime())) continue;
    schedule(f._id.toString(), unlockAt, f.metadata?.uploadedByEmail || '');
  }
}

export function scheduleUnlockNotification(id: string, unlockAt: Date, to: string) {
  schedule(id, unlockAt, to);
}

export function cancelUnlockNotification(id: string) {
  const entry = timers.get(id);
  if (entry) {
    clearTimeout(entry.timeout);
    timers.delete(id);
  }
}
