import { NextResponse } from 'next/server';
 import connectDB from '@/lib/db';
 import { withAuth, AuthRequest } from '@/lib/middleware';
 import Mood from '@/lib/models/Mood';
import type { PipelineStage } from 'mongoose';
 
 export const runtime = 'nodejs';
 export const dynamic = 'force-dynamic';
 
 async function handler(req: AuthRequest) {
   try {
     await connectDB();
     const owner = req.user?.userId || req.user?.email;
     if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const url = new URL(req.url);
    const startParam = url.searchParams.get('start');
    const endParam = url.searchParams.get('end');
    const daysParam = url.searchParams.get('days');
    let since = new Date();
    let until = new Date();
    if (startParam) {
      const s = new Date(startParam);
      if (!isNaN(s.getTime())) since = s;
    } else if (daysParam) {
      const d = parseInt(daysParam || '7', 10);
      since.setDate(since.getDate() - (isNaN(d) ? 7 : d));
    } else {
      since.setDate(since.getDate() - 7);
    }
    if (endParam) {
      const e = new Date(endParam);
      if (!isNaN(e.getTime())) until = e;
    }
    const pipeline: PipelineStage[] = [
      { $match: { owner: (owner || '').toLowerCase(), createdAt: { $gte: since, $lte: until } } },
      { $addFields: { day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } } } },
      { $sort: { createdAt: -1 as 1 | -1 } },
      { $group: { _id: '$day', latest: { $first: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$latest' } },
    ];
    const distinctDays = await Mood.aggregate(pipeline);
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const dailyScores: Record<string, number> = {};
    distinctDays.forEach((m: any) => {
      counts[m.score] = (counts[m.score] || 0) + 1;
      const key = new Date(m.createdAt);
      const y = key.getFullYear();
      const mm = String(key.getMonth() + 1).padStart(2, '0');
      const dd = String(key.getDate()).padStart(2, '0');
      dailyScores[`${y}-${mm}-${dd}`] = m.score;
    });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayLatest = await Mood.findOne({ owner: (owner || '').toLowerCase(), createdAt: { $gte: today } }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ today: todayLatest?.score || null, last7: counts, dailyScores });
   } catch (error: any) {
     return NextResponse.json({ error: error?.message || 'Failed to load stats' }, { status: 500 });
   }
 }
 
 export const GET = withAuth(handler);
