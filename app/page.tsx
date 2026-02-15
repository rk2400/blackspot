'use client';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/lib/contexts/UserContext';
import toast from 'react-hot-toast';

function useDailyAffirmation() {
  const affirmations = [
    'I am present and grounded',
    'My breath guides me to calm',
    'I honor my inner wisdom',
    'I choose compassion today',
    'I am aligned with my purpose',
    'I trust the rhythm of life',
  ];
  const key = useMemo(() => {
    const d = new Date();
    return d.getFullYear() * 1000 + (d.getMonth() + 1) * 50 + d.getDate();
  }, []);
  return affirmations[key % affirmations.length];
}

function getMoonPhase(date: Date) {
  const synodicMonth = 29.530588853;
  const knownNewMoon = new Date(Date.UTC(2000, 0, 6, 18, 14));
  const daysSince = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const phase = ((daysSince % synodicMonth) + synodicMonth) % synodicMonth;
  if (phase < 1.84566) return { name: 'New Moon', emoji: '🌑' };
  if (phase < 5.53699) return { name: 'Waxing Crescent', emoji: '🌒' };
  if (phase < 9.22831) return { name: 'First Quarter', emoji: '🌓' };
  if (phase < 12.91963) return { name: 'Waxing Gibbous', emoji: '🌔' };
  if (phase < 16.61096) return { name: 'Full Moon', emoji: '🌕' };
  if (phase < 20.30228) return { name: 'Waning Gibbous', emoji: '🌖' };
  if (phase < 23.99361) return { name: 'Last Quarter', emoji: '🌗' };
  if (phase < 27.68493) return { name: 'Waning Crescent', emoji: '🌘' };
  return { name: 'New Moon', emoji: '🌑' };
}

function getPhaseDetails(date: Date) {
  const synodicMonth = 29.530588853;
  const knownNewMoon = new Date(Date.UTC(2000, 0, 6, 18, 14));
  const daysSince = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const age = ((daysSince % synodicMonth) + synodicMonth) % synodicMonth; // days since new
  const illumination = Math.round((1 - Math.cos((age / synodicMonth) * 2 * Math.PI)) * 50); // ~0-100%
  const daysToFull = age <= 15 ? Math.max(0, 15 - age) : 29.53 - age + 15;
  const daysToNew = 29.53 - age;
  const upcoming = [
    { label: 'First Quarter', inDays: Math.max(0, 7.38 - age) },
    { label: 'Full Moon', inDays: Math.max(0, 15.0 - age) },
    { label: 'Last Quarter', inDays: Math.max(0, 22.1 - age) },
    { label: 'New Moon', inDays: Math.max(0, 29.53 - age) },
  ].map((p) => ({ label: p.label, date: new Date(date.getTime() + p.inDays * 24 * 60 * 60 * 1000) }));
  return { age, illumination, daysToFull: Math.round(daysToFull), daysToNew: Math.round(daysToNew), upcoming };
}
function formatDateUTC(date: Date) {
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = String(date.getUTCFullYear());
  return `${dd}/${mm}/${yyyy}`;
}
export default function HomePage() {
  const affirmation = useDailyAffirmation();
  const { user } = useUser();
  const [breathState, setBreathState] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');
  const [timerRunning, setTimerRunning] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [breathMinutes, setBreathMinutes] = useState<number>(5);
  const [breathEnd, setBreathEnd] = useState<number | null>(null);
  const [sessionLeftSec, setSessionLeftSec] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [journalsCount, setJournalsCount] = useState<number>(0);
  const [journalPreview, setJournalPreview] = useState<Array<{ id: string; title: string; content: string; createdAt?: string }>>([]);
  const [moodToday, setMoodToday] = useState<number | null>(null);
  const [moodBars, setMoodBars] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [moodScore, setMoodScore] = useState<number>(3);
  const [moodSavedScore, setMoodSavedScore] = useState<number | null>(null);
  const [affShift, setAffShift] = useState<number>(0);
  const [phase, setPhase] = useState(getMoonPhase(new Date()));
  const [phaseDetails, setPhaseDetails] = useState(getPhaseDetails(new Date()));

  useEffect(() => {
    const now = new Date();
    setPhase(getMoonPhase(now));
    setPhaseDetails(getPhaseDetails(now));
  }, []);

  useEffect(() => {
    // no-op
  }, []);

  useEffect(() => {
    if (!timerRunning) return;
    let duration = 0;
    if (breathState === 'inhale') duration = 4;
    else if (breathState === 'hold') duration = 4;
    else if (breathState === 'exhale') duration = 6;
    setCountdown(duration);
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          if (breathState === 'inhale') setBreathState('hold');
          else if (breathState === 'hold') setBreathState('exhale');
          else if (breathState === 'exhale') setBreathState('inhale');
          return duration;
        }
        return c - 1;
      });
      setSessionLeftSec((s) => {
        if (s === null) return null;
        if (s <= 1) {
          setTimerRunning(false);
          setBreathState('idle');
          setCountdown(0);
          try {
            audioRef.current?.pause();
            if (audioRef.current) audioRef.current.currentTime = 0;
          } catch {}
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, breathState]);

  function startSession() {
    const mins = Math.max(1, Math.min(50, breathMinutes));
    setBreathMinutes(mins);
    setSessionLeftSec(mins * 60);
    setBreathEnd(Date.now() + mins * 60 * 1000);
    setBreathState('inhale');
    setTimerRunning(true);
    try {
      if (audioRef.current) {
        audioRef.current.volume = 0.2;
        audioRef.current.loop = true;
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    } catch {}
  }
  function pauseSession() {
    setTimerRunning(false);
    try {
      audioRef.current?.pause();
    } catch {}
  }
  function resumeSession() {
    if (!sessionLeftSec || sessionLeftSec <= 0) return;
    setBreathEnd(Date.now() + sessionLeftSec * 1000);
    setTimerRunning(true);
    try {
      if (audioRef.current) {
        audioRef.current.loop = true;
        audioRef.current.play().catch(() => {});
      }
    } catch {}
  }
  function restartSession() {
    const mins = Math.max(1, Math.min(50, breathMinutes));
    setSessionLeftSec(mins * 60);
    setBreathEnd(Date.now() + mins * 60 * 1000);
    setBreathState('inhale');
    setTimerRunning(true);
    setCountdown(4);
    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.loop = true;
        audioRef.current.play().catch(() => {});
      }
    } catch {}
  }

  // mood check-in removed

  useEffect(() => {
    const t = setInterval(() => setAffShift((s) => (s + 1) % 200), 60);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const j = await fetch('/api/journal/list', { credentials: 'same-origin', cache: 'no-store' }).then((r) => r.json());
        const items = (j.items || []);
        setJournalsCount(items.length);
        setJournalPreview(items.slice(0, 3));
      } catch {}
      try {
        const s = await fetch('/api/mood/stats', { credentials: 'same-origin', cache: 'no-store' }).then((r) => r.json());
        if (s.today !== undefined) setMoodToday(s.today || null);
        if (s.last7) setMoodBars(s.last7);
      } catch {}
    })();
  }, [user]);

  async function submitMood() {
    if (!user) {
      toast.error('Please log in to save mood');
      return;
    }
    try {
      const res = await fetch('/api/mood/add', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: moodScore }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d?.error || 'Failed to save mood');
      toast.success('Mood logged');
      setMoodSavedScore(moodScore);
      const s = await fetch('/api/mood/stats', { credentials: 'same-origin', cache: 'no-store' }).then((r) => r.json());
      if (s.today !== undefined) setMoodToday(s.today || null);
      if (s.last7) setMoodBars(s.last7);
    } catch (err: any) {
      toast.error(err.message || 'Failed to log mood');
    }
  }

  return (
    <div className="bg-stone-950 text-white">
      <section className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0">
          <video
            className="w-full h-full object-cover"
            src="https://cdn.pixabay.com/video/2024/03/08/203416-921381931_large.mp4"
            autoPlay
            playsInline
            muted
            loop
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.12),transparent_60%),radial-gradient(ellipse_at_bottom_right,rgba(244,63,94,0.12),transparent_60%)]" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-28 flex flex-col items-start">
          <span className="inline-block py-1 px-4 rounded-full bg-white/10 text-white/80 text-sm font-bold tracking-widest uppercase mb-6 backdrop-blur-sm border border-white/20">
            The BlackSpot Project
          </span>
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight tracking-tight">
            Wellness That Feels Alive
          </h1>
          <p className="text-lg md:text-2xl mb-10 text-stone-200 font-light leading-relaxed max-w-2xl">
            Breathe. Affirm. Reflect. Explore your inner cosmos with tools designed to energize and soothe.
          </p>
          <div className="flex gap-4">
            <Link href="/afirmations" className="btn btn-primary">Start Affirmations</Link>
            <Link href="/manifest" className="btn btn-secondary">Open Manifest</Link>
          </div>
        </div>
      </section>

      <section className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(99,102,241,0.18),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(244,63,94,0.14),transparent_40%)]" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="text-stone-300 mb-3 uppercase tracking-widest text-sm">Today’s Affirmation</div>
          <div
            className="text-3xl md:text-5xl font-serif leading-snug"
            style={{
              backgroundImage:
                'linear-gradient(90deg, rgba(255,255,255,0.3) 0%, rgba(167,139,250,0.9) 20%, rgba(244,114,182,0.9) 40%, rgba(167,139,250,0.9) 60%, rgba(255,255,255,0.3) 80%)',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              backgroundSize: '200% 100%',
              backgroundPosition: `${affShift}% 0%`,
              transition: 'background-position 60ms linear',
            }}
          >
            {affirmation}
          </div>
          <Link href="/afirmations" className="inline-block mt-8 text-sm text-indigo-300 hover:text-indigo-200">
            Explore Morning & Night →
          </Link>
        </div>
      </section>

      <section className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2000&auto=format&fit=crop"
            alt="Breath"
            fill
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 via-stone-900/60 to-violet-900/50" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-6 w-full grid md:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col">
            <h2 className="text-4xl font-serif mb-4">Guided Breath</h2>
            <p className="text-stone-300 mb-6">Inhale • Hold • Exhale — let your breath set the rhythm.</p>
            <div className="text-stone-200 mb-6">
              {breathState === 'idle' ? 'Ready' : breathState === 'inhale' ? 'Inhale' : breathState === 'hold' ? 'Hold' : 'Exhale'}
              {countdown ? ` • ${countdown}s` : ''}
            </div>
            <div className="flex items-center gap-3 mb-4">
              <label className="text-sm text-stone-300">Timer (minutes)</label>
              <input
                type="number"
                min={1}
                max={50}
                value={breathMinutes}
                onChange={(e) => setBreathMinutes(Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
                className="px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 w-24"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="text-stone-300 mr-auto">
                {timerRunning && sessionLeftSec !== null
                  ? (() => {
                      const sec = Math.max(0, sessionLeftSec || 0);
                      const mm = Math.floor(sec / 60);
                      const ss = String(sec % 60).padStart(2, '0');
                      return `Session left • ${mm}:${ss}`;
                    })()
                  : sessionLeftSec
                  ? (() => {
                      const sec = Math.max(0, sessionLeftSec || 0);
                      const mm = Math.floor(sec / 60);
                      const ss = String(sec % 60).padStart(2, '0');
                      return `Paused • ${mm}:${ss}`;
                    })()
                  : 'Session ready'}
              </div>
              <button
                className={timerRunning ? 'btn btn-secondary' : 'btn btn-primary'}
                onClick={() => {
                  if (timerRunning) {
                    pauseSession();
                  } else if (sessionLeftSec && sessionLeftSec > 0) {
                    resumeSession();
                  } else {
                    startSession();
                  }
                }}
              >
                {timerRunning ? 'Pause' : 'Start'}
              </button>
              {sessionLeftSec && sessionLeftSec > 0 ? (
                <button className="btn" onClick={restartSession}>Restart</button>
              ) : null}
            </div>
            <audio
              ref={audioRef}
              src="https://cdn.pixabay.com/download/audio/2023/05/03/audio_36d95efb11.mp3?filename=meditation-ambient-143226.mp3"
              preload="none"
            />
          </div>
          <div className="flex items-center justify-center">
            <div
              className="w-56 h-56 md:w-72 md:h-72 rounded-full bg-gradient-to-br from-indigo-500/40 to-violet-500/40 border border-indigo-300/30 shadow-2xl transition-transform duration-700"
              style={{
                transform:
                  breathState === 'inhale' || breathState === 'hold'
                    ? 'scale(1.15)'
                    : breathState === 'exhale'
                    ? 'scale(0.85)'
                    : 'scale(1)',
              }}
            />
          </div>
        </div>
      </section>

      {/* Mood check-in section removed as requested */}

      <section className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0">
          <Image
            src="https://cdn.pixabay.com/photo/2020/08/11/15/23/tree-5480239_1280.jpg"
            alt="Cosmic"
            fill
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/60 to-black/80" />
        </div>
        <div className="relative z-10 px-6 w-full max-w-6xl">
          <div className="text-stone-300 uppercase tracking-widest text-sm mb-6 text-center">Cosmic Cycle</div>
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-500/30 border border-indigo-300/30 shadow-2xl" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-7xl">{phase.emoji}</div>
                </div>
              </div>
              <div className="mt-4 text-2xl font-serif">{phase.name}</div>
              <div className="mt-2 text-stone-300">Illumination ~ {phaseDetails.illumination}%</div>
              <div className="mt-1 text-stone-400 text-sm">Days to Full: {phaseDetails.daysToFull} • Days to New: {phaseDetails.daysToNew}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6">
              <div className="text-stone-300 uppercase tracking-widest text-xs mb-3">Upcoming Phases</div>
              <div className="grid grid-cols-2 gap-4">
                {phaseDetails.upcoming.map((p, i) => (
                  <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="text-sm text-stone-400">{p.label}</div>
                     <div className="text-stone-200">{formatDateUTC(p.date)}</div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-stone-300 text-sm leading-relaxed">
                The moon’s cycle spans ~29.53 days from New to New. Illumination grows (waxing) until Full, then fades (waning) back to New. Use this rhythm to plan rest, reflection, and intention-setting.
              </p>
            </div>
          </div>
        </div>
      </section>
      {user && (
        <section className="relative min-h-screen flex items-center justify-center">
          <div className="absolute inset-0">
            <Image
              src="https://cdn.pixabay.com/photo/2020/11/07/01/41/abstract-5719578_1280.jpg"
              alt="Dashboard"
              fill
              className="object-cover opacity-15"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black/80" />
          </div>
          <div className="relative z-10 w-full max-w-7xl px-6">
            <div className="text-stone-300 uppercase tracking-widest text-sm mb-6 text-center">Your Dashboard</div>
            <DashboardContent
              journalsCount={journalsCount}
              journalPreview={journalPreview}
              moodBars={moodBars}
              moodToday={moodToday}
              moodScore={moodScore}
              moodSavedScore={moodSavedScore}
              setMoodScore={setMoodScore}
              submitMood={submitMood}
            />
          </div>
        </section>
      )}
    </div>
  );
}

function DashboardContent(props: {
  journalsCount: number;
  journalPreview: Array<{ id: string; title: string; content: string; createdAt?: string }>;
  moodBars: Record<number, number>;
  moodToday: number | null;
  moodScore: number;
  moodSavedScore: number | null;
  setMoodScore: (n: number) => void;
  submitMood: () => Promise<void> | void;
}) {
  const counts = props.moodBars;
  const total = (counts[1] || 0) + (counts[2] || 0) + (counts[3] || 0) + (counts[4] || 0) + (counts[5] || 0);
  const avg = total
    ? ((1 * (counts[1] || 0) + 2 * (counts[2] || 0) + 3 * (counts[3] || 0) + 4 * (counts[4] || 0) + 5 * (counts[5] || 0)) / total)
    : null;
  const avgPct = avg ? (avg / 5) * 360 : 0;
  const maxCount = Math.max(counts[1] || 0, counts[2] || 0, counts[3] || 0, counts[4] || 0, counts[5] || 0, 1);
  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 flex flex-col items-center">
          <div className="text-4xl">📝</div>
          <div className="mt-3 text-stone-200 text-lg">Journals</div>
          {props.journalsCount > 0 ? (
            <>
              <div className="text-4xl font-serif">{props.journalsCount}</div>
              <div className="mt-4 w-full">
                <div className="text-stone-400 uppercase tracking-widest text-xs mb-2">Recent</div>
                <div className="space-y-3 w-full">
                  {props.journalPreview.map((j) => (
                    <div key={j.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="text-sm font-semibold text-stone-200">{j.title || 'Untitled'}</div>
                      <div className="text-xs text-stone-400 mt-1">
                        {String(j.content || '').length > 90 ? String(j.content || '').slice(0, 90) + '…' : (j.content || '')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-5">
                <Link href="/journal" className="px-4 py-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-500">Open Journal</Link>
              </div>
            </>
          ) : (
            <>
              <div className="mt-2 text-sm text-stone-300 text-center">
                You haven't written a journal yet.<br />Start with one reflection today.
              </div>
              <div className="mt-4 w-full">
                <div className="rounded-xl border border-indigo-400/30 bg-indigo-500/10 p-4 text-center w-full">
                  <div className="text-stone-200">Prompt: What energized me today?</div>
                </div>
              </div>
              <div className="mt-5">
                <Link href="/journal" className="px-4 py-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-500">Write Your First Journal</Link>
              </div>
            </>
          )}
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 flex flex-col items-center">
          {(() => {
            const t = props.moodToday ?? null;
            const color = t ? (t < 3 ? '#ef4444' : t === 3 ? '#f59e0b' : '#10b981') : '#6b7280';
            const fill = t ? (t / 5) * 360 : avgPct;
            return (
              <div
                className="w-28 h-28 rounded-full"
                style={{ background: `conic-gradient(${color} ${fill}deg, rgba(255,255,255,0.12) 0)` }}
                title={t ? `Today ${t}` : avg ? `Avg ${avg.toFixed(1)}` : 'No mood logged'}
              />
            );
          })()}
          <div className="mt-3 text-stone-200 text-lg">{props.moodToday ? 'Mood Today' : 'Mood Avg'}</div>
          <div className="text-3xl font-serif">{props.moodToday ? props.moodToday : avg ? avg.toFixed(1) : '-'}</div>
          <div className="mt-2 w-full h-16 flex items-end gap-1">
            {[1, 2, 3, 4, 5].map((s) => {
              const v = counts[s] || 0;
              const h = Math.round((v / maxCount) * 100);
              return (
                <div
                  key={s}
                  className="flex-1 rounded-t"
                  style={{ height: `${h}%`, background: s < 3 ? '#ef4444' : s === 3 ? '#f59e0b' : '#10b981' }}
                  title={`${s}: ${v}`}
                />
              );
            })}
          </div>
          <div className="text-sm text-stone-400">Today {props.moodToday ?? '-'}</div>
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6">
        <div className="text-stone-300 uppercase tracking-widest text-xs mb-3">Mood Logger</div>
        <div className="flex items-center gap-3">
          {[
            { s: 1, emoji: '😞', label: 'Very low', color: '#ef4444' },
            { s: 2, emoji: '🙁', label: 'Low', color: '#f97316' },
            { s: 3, emoji: '😐', label: 'Neutral', color: '#f59e0b' },
            { s: 4, emoji: '🙂', label: 'Good', color: '#10b981' },
            { s: 5, emoji: '😄', label: 'Great', color: '#22c55e' },
          ].map(({ s, emoji, label, color }) => (
            <button
              key={s}
              onClick={() => props.setMoodScore(s)}
              className={`group relative w-12 h-12 rounded-full flex items-center justify-center transition transform ${
                props.moodScore === s ? 'scale-110' : 'hover:scale-105'
              }`}
              style={{ border: `2px solid ${props.moodScore === s ? color : 'rgba(255,255,255,0.25)'}`, background: 'rgba(255,255,255,0.08)' }}
              aria-label={`Mood ${label}`}
              title={label}
            >
              <span className="text-2xl">{emoji}</span>
              <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/80 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition">
                {label}
              </span>
            </button>
          ))}
          <button onClick={props.submitMood} className="btn btn-primary ml-2">Log Mood</button>
        </div>
        {props.moodSavedScore ? (
          <div className="mt-3 text-stone-300 text-sm">
            {props.moodSavedScore === 1
              ? 'Bad days are common; look forward to nice things.'
              : props.moodSavedScore === 2
              ? 'It’s okay to feel low; be gentle and take small steps.'
              : props.moodSavedScore === 3
              ? 'Neutral days are a reset; notice small positives.'
              : props.moodSavedScore === 4
              ? 'Good day; savor moments and share gratitude.'
              : 'Great energy; channel it into what you love.'}
          </div>
        ) : null}
      </div>
    </div>
  );
}
