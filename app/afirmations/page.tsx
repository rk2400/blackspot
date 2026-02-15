 'use client';
 
 import { useEffect, useRef, useState } from 'react';
 import Link from 'next/link';
 import { useUser } from '@/lib/contexts/UserContext';
 import toast from 'react-hot-toast';
 import Image from 'next/image';
 
 const MORNING = [
   'I welcome this day with calm and clarity',
   'My thoughts are gentle and focused',
   'I choose gratitude and grounded energy',
   'I am aligned with my intentions',
   'Peace guides my actions today',
   'I nourish my body, mind, and spirit',
   'I trust the rhythm of my journey',
 ];
 
 const NIGHT = [
   'I release the day with ease and softness',
   'My spirit rests in safety and peace',
   'I let go and allow healing',
   'My heart is light and my mind is clear',
   'I am supported by quiet, restorative energy',
   'I forgive, I soften, I settle',
   'I drift into deep, replenishing rest',
 ];
 
 function Chip({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
   return (
     <button
       onClick={onClick}
       className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-white/5 text-stone-200 hover:bg-white/10'}`}
     >
       {children}
     </button>
   );
 }
 
function ListItem({ text, tone }: { text: string; tone: 'morning' | 'night' }) {
  return (
    <li className="group relative flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-4 hover:bg-white/7 transition">
      <span
        className={`mt-1 inline-block w-1.5 h-6 rounded-full ${
          tone === 'morning' ? 'bg-gradient-to-b from-amber-300 to-rose-300' : 'bg-gradient-to-b from-indigo-400 to-violet-400'
        }`}
      />
      <p className="text-lg leading-relaxed text-stone-200">{text}</p>
    </li>
  );
}
 
 export default function Afirmations() {
  const { user, loading: userLoading } = useUser();
   const [mode, setMode] = useState<'morning' | 'night'>('morning');
  const [items, setItems] = useState<Array<{ id: string; text: string }>>([]);
  const [newText, setNewText] = useState('');
  const [loading, setLoading] = useState(false);
  const [muted, setMuted] = useState(true);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourcesRef = useRef<Array<OscillatorNode>>([]);
  const gainRef = useRef<GainNode | null>(null);
  const [idx, setIdx] = useState(0);
 
  async function load(modeSel: 'morning' | 'night') {
    try {
      setLoading(true);
      const res = await fetch(`/api/afirmations/list?mode=${modeSel}`, { cache: 'no-store', credentials: 'same-origin' });
      const data = await res.json();
      setItems((data.items || []).map((i: any) => ({ id: i.id, text: i.text })));
      setIdx(0);
    } catch (err) {
      console.error('affirmations list', err);
    } finally {
      setLoading(false);
    }
  }
 
 
 
  async function deleteItem(id: string) {
    const prev = [...items];
    setItems((p) => p.filter((x) => x.id !== id));
    try {
      const res = await fetch(`/api/afirmations/${id}`, { method: 'DELETE', cache: 'no-store', credentials: 'same-origin' });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.error || 'Delete failed');
      }
      await load(mode);
    } catch (err) {
      console.error('delete affirm', err);
      setItems(prev);
    }
  }
 
  function prev() {
    setIdx((i) => (items.length ? (i - 1 + items.length) % items.length : 0));
  }
  function next() {
    setIdx((i) => (items.length ? (i + 1) % items.length : 0));
  }
  function select(i: number) {
    if (i >= 0 && i < items.length) setIdx(i);
  }

  function startAmbient() {
    if (audioCtxRef.current) return;
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioCtxRef.current = ctx;
    const gain = ctx.createGain();
    gain.gain.value = 0.02;
    gainRef.current = gain;
    gain.connect(ctx.destination);
    const freqs = mode === 'morning' ? [220, 277, 330] : [196, 233, 294];
    sourcesRef.current = freqs.map((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = f;
      osc.detune.value = i * 6;
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.12 + i * 0.07;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 3;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.detune);
      lfo.start();
      osc.connect(gain);
      osc.start();
      return osc;
    });
  }
 
  function stopAmbient() {
    if (!audioCtxRef.current) return;
    sourcesRef.current.forEach((s) => {
      try { s.stop(); } catch {}
    });
    sourcesRef.current = [];
    try { audioCtxRef.current.close(); } catch {}
    audioCtxRef.current = null;
    gainRef.current = null;
  }
 
  function toggleSound() {
    if (muted) {
      startAmbient();
      setMuted(false);
    } else {
      stopAmbient();
      setMuted(true);
    }
  }
 
  useEffect(() => {
    load(mode);
    if (!muted) {
      stopAmbient();
      startAmbient();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);
 
  async function addItem() {
    const text = newText.trim();
    if (!text) return;
    if (!user) {
      toast.error('Please log in to add affirmations');
      return;
    }
    try {
      const res = await fetch('/api/afirmations/add', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, mode }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.error || 'Failed to add');
      }
      const d = await res.json();
      setItems((prev) => [...prev, { id: d.id, text: d.text }]);
      setNewText('');
    } catch (err) {
      console.error('add affirm', err);
    }
  }

   return (
     <div className="min-h-screen bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 text-white">
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0">
          <Image
            src="https://static.vecteezy.com/system/resources/thumbnails/049/855/471/small/nature-background-high-resolution-wallpaper-for-a-serene-and-stunning-view-free-photo.jpg"
            alt="Affirmations"
            fill
            className="object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 via-stone-900/60 to-rose-900/50" />
        </div>
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <div className="text-stone-300 uppercase tracking-widest text-sm mb-3">Daily Practice</div>
          <h1 className="text-4xl md:text-6xl font-serif">Affirmations</h1>
          <p className="text-stone-300 mt-3">Create, focus, and browse your personal affirmations with a calm flow.</p>
        </div>
      </section>
       <div className="max-w-6xl mx-auto px-6 py-12">
        {!user && (
          <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 text-center">
            <h2 className="text-xl font-semibold">Log in to save your affirmations</h2>
            <p className="text-stone-300 mt-2">You can browse and preview the interface, but saving requires login.</p>
            <Link href="/login" className="mt-4 inline-block px-5 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500">Go to Login</Link>
          </div>
        )}
         <div className="rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md">
           <div className="grid md:grid-cols-2">
             <div className="p-10 md:p-14">
               <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Affirmations</h1>
               <p className="mt-4 text-stone-300">
                 Gentle words to align your energy with the time of day. Choose a soothing morning start or a calm night release.
               </p>
               <div className="mt-6 flex items-center gap-3">
                 <Chip active={mode === 'morning'} onClick={() => setMode('morning')}>Morning</Chip>
                 <Chip active={mode === 'night'} onClick={() => setMode('night')}>Night</Chip>
               </div>
             </div>
             <div className="relative">
               <div className="h-full w-full bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-pink-500/10 md:min-h-[320px]" />
               <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.12),transparent_60%)]" />
             </div>
           </div>
         </div>
 
        <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${mode === 'morning' ? 'bg-amber-300/30 text-amber-200' : 'bg-indigo-500/30 text-indigo-200'}`}>
              {mode === 'morning' ? '☀️' : '🌙'}
            </div>
            <div className="text-lg font-semibold">{mode === 'morning' ? 'Morning' : 'Night'}</div>
            <div className="ml-auto flex items-center gap-2">
              <button
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-stone-200 text-sm"
                onClick={toggleSound}
              >
                {muted ? 'Play Music' : 'Mute Music'}
              </button>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-8 text-center">
              <div className="text-stone-400 uppercase tracking-widest text-xs mb-3">Your Affirmation</div>
              <div className="text-3xl md:text-4xl font-serif leading-snug min-h-[96px]">
                {items.length ? items[idx]?.text : 'No affirmations yet'}
              </div>
              <div className="mt-6 flex items-center justify-center gap-4">
                <button onClick={prev} disabled={!items.length} className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-stone-200 disabled:opacity-40">Prev</button>
                <button onClick={next} disabled={!items.length} className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-stone-200 disabled:opacity-40">Next</button>
                {items.length ? (
                  <button
                    onClick={() => {
                      if (!user) {
                        toast.error('Please log in to delete affirmations');
                        return;
                      }
                      deleteItem(items[idx].id);
                    }}
                    className="px-4 py-2 rounded-full bg-red-600/80 hover:bg-red-600 text-white"
                    disabled={!user}
                  >
                    Delete
                  </button>
                ) : null}
              </div>
              <div className="mt-4 flex items-center justify-center gap-2">
                {items.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => select(i)}
                    className={`w-2.5 h-2.5 rounded-full ${i === idx ? (mode === 'morning' ? 'bg-amber-300' : 'bg-indigo-400') : 'bg-white/20'} `}
                  />
                ))}
              </div>
            </div>
          </div>
 
          <div className="mt-6 flex items-center gap-3">
            <input
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder={`Add a ${mode} affirmation...`}
              className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-stone-200 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
            <button
              onClick={addItem}
              className="px-5 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition disabled:opacity-50"
              disabled={!newText.trim() || !user}
            >
              Add
            </button>
          </div>
        </div>
 
        <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-8">
          <h2 className="text-2xl font-semibold">How to use</h2>
          <div className="mt-3 text-stone-300">
            <p className="leading-relaxed">
              Create your own affirmations and browse them with the controls above. Read slowly, breathe softly, and let each line settle. If there are no affirmations yet, add one using the input and “Add” button.
            </p>
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div>
                <div className="text-stone-400 uppercase tracking-widest text-xs mb-2">Morning Examples</div>
                <ul className="space-y-2">
                  {MORNING.map((t, i) => (
                    <li key={i} className="text-stone-200">{t}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-stone-400 uppercase tracking-widest text-xs mb-2">Night Examples</div>
                <ul className="space-y-2">
                  {NIGHT.map((t, i) => (
                    <li key={i} className="text-stone-200">{t}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
       </div>
     </div>
   );
 }
