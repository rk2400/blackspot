 'use client';
 
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/lib/contexts/UserContext';
import toast from 'react-hot-toast';
import Image from 'next/image';
 
function ImgWithFallback(props: { src: string; alt?: string; className?: string; fallbackText: string }) {
  const [error, setError] = useState(false);
  const hasSrc = !!props.src && props.src.trim().length > 0;
  if (!error && hasSrc) {
    return <img src={props.src} alt={props.alt || 'Image'} className={props.className} onError={() => setError(true)} />;
  }
  return <div className={`${props.className} bg-stone-800 flex items-center justify-center text-stone-400 text-xs`}>{props.fallbackText}</div>;
}
 
 interface Entry {
   id: string;
   title: string;
   content: string;
   createdAt?: string;
  imageUrl?: string;
 }
 
 export default function JournalPage() {
  const { user, loading: userLoading } = useUser();
   const [entries, setEntries] = useState<Entry[]>([]);
   const [title, setTitle] = useState('');
   const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
   const [loading, setLoading] = useState(false);
   const [saving, setSaving] = useState(false);
   const [flash, setFlash] = useState<string | null>(null);
   const [selectedId, setSelectedId] = useState<string | null>(null);
   const containerRef = useRef<HTMLDivElement | null>(null);
  const [monthRef, setMonthRef] = useState<Date>(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0,0,0,0);
    return d;
  });
  const [moodByDay, setMoodByDay] = useState<Record<string, number>>({});
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
 
   async function load() {
     try {
       setLoading(true);
      const res = await fetch('/api/journal/list', { cache: 'no-store', credentials: 'same-origin' });
       const data = await res.json();
      setEntries((data.items || []).map((i: any) => ({ id: i.id, title: i.title, content: i.content, imageUrl: i.imageUrl, createdAt: i.createdAt })));
     } catch (err) {
       console.error('journal list', err);
     } finally {
       setLoading(false);
     }
   }
  async function loadMonthMood(d: Date) {
    try {
      const start = new Date(d);
      const end = new Date(d);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0); // last day of target month
      const pad = (n: number) => String(n).padStart(2, '0');
      const qs = `start=${start.getFullYear()}-${pad(start.getMonth()+1)}-${pad(1)}&end=${end.getFullYear()}-${pad(end.getMonth()+1)}-${pad(end.getDate())}`;
      const res = await fetch(`/api/mood/stats?${qs}`, { cache: 'no-store', credentials: 'same-origin' });
      const data = await res.json();
      setMoodByDay(data.dailyScores || {});
    } catch (err) {}
  }
 
  async function addEntry() {
     const c = content.trim();
     if (!c) return;
    if (!user) {
      toast.error('Please log in to save journal entries');
      return;
    }
     try {
       setSaving(true);
       const res = await fetch('/api/journal/add', {
         method: 'POST',
         credentials: 'same-origin',
         headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), content: c, imageUrl: imageUrl.trim() }),
       });
       if (!res.ok) {
         const d = await res.json().catch(() => ({}));
         throw new Error(d?.error || 'Failed to save');
       }
       const d = await res.json();
      setEntries((prev) => [{ id: d.id, title: d.title, content: d.content, imageUrl: d.imageUrl, createdAt: d.createdAt }, ...prev]);
       setTitle('');
       setContent('');
      setImageUrl('');
       setFlash('Saved ✓');
       setTimeout(() => setFlash(null), 1500);
       setSelectedId(d.id);
       // Scroll to top
       containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
     } catch (err) {
       console.error('journal add', err);
     } finally {
       setSaving(false);
     }
   }
  async function uploadImage(file: File) {
    try {
      setUploadError(null);
      setUploading(true);
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/journal/image/upload', {
        method: 'POST',
        credentials: 'same-origin',
        body: form,
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.error || 'Failed to upload image');
      }
      const d = await res.json();
      setImageUrl(d.url || '');
    } catch (err: any) {
      setUploadError(err?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }
 
   async function deleteEntry(id: string) {
     const prev = [...entries];
     setEntries((p) => p.filter((e) => e.id !== id));
     try {
      if (!user) {
        toast.error('Please log in to delete entries');
        setEntries(prev);
        return;
      }
       const res = await fetch(`/api/journal/${id}`, { method: 'DELETE', cache: 'no-store', credentials: 'same-origin' });
       if (!res.ok) {
         const d = await res.json().catch(() => ({}));
         throw new Error(d?.error || 'Delete failed');
       }
       setFlash('Deleted ✓');
       setTimeout(() => setFlash(null), 1200);
     } catch (err) {
       setEntries(prev);
     }
   }
 
   useEffect(() => {
     load();
   }, []);
  useEffect(() => {
    loadMonthMood(monthRef);
  }, [monthRef]);
 
   const selected = entries.find((e) => e.id === selectedId) || entries[0] || null;
 
  const disabled = !user;
  const monthLabel = useMemo(() => monthRef.toLocaleString(undefined, { month: 'long', year: 'numeric' }), [monthRef]);
  const days = useMemo(() => {
    const start = new Date(monthRef);
    const firstWeekday = start.getDay(); // 0 Sun - 6 Sat
    const end = new Date(monthRef);
    end.setMonth(end.getMonth() + 1);
    end.setDate(0);
    const totalDays = end.getDate();
    const arr: Array<{ key: string | null; n: number | null }> = [];
    for (let i = 0; i < firstWeekday; i++) arr.push({ key: null, n: null });
    const pad = (n: number) => String(n).padStart(2, '0');
    for (let d = 1; d <= totalDays; d++) {
      const key = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(d)}`;
      arr.push({ key, n: d });
    }
    while (arr.length % 7 !== 0) arr.push({ key: null, n: null });
    return arr;
  }, [monthRef]);
  const dayEntries = useMemo(() => {
    if (!selectedDay) return [];
    return entries.filter((e) => {
      if (!e.createdAt) return false;
      const d = new Date(e.createdAt);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${dd}` === selectedDay;
    });
  }, [entries, selectedDay]);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogEntry, setDialogEntry] = useState<Entry | null>(null);
  const storyboardImages = useMemo(() => {
    const m = monthRef.getMonth();
    const y = monthRef.getFullYear();
    return entries
      .filter((e) => {
        if (!e.createdAt) return false;
        if (!e.imageUrl || !e.imageUrl.trim()) return false;
        const d = new Date(e.createdAt);
        return d.getMonth() === m && d.getFullYear() === y;
      })
      .map((e) => e.imageUrl!.trim());
  }, [entries, monthRef]);
  const [storyLightboxIndex, setStoryLightboxIndex] = useState<number | null>(null);

   return (
     <div className="min-h-screen bg-stone-950 text-white">
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2000&auto=format&fit=crop"
            alt="Journal"
            fill
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 via-stone-900/60 to-violet-900/50" />
        </div>
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <div className="text-stone-300 uppercase tracking-widest text-sm mb-3">Reflect & Write</div>
          <h1 className="text-4xl md:text-6xl font-serif">Journal</h1>
          <p className="text-stone-300 mt-3">Capture thoughts, reflections, and intentions for your journey.</p>
        </div>
      </section>
       <main className="max-w-7xl mx-auto px-6 py-12">
        {!user && (
          <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 text-center">
            <h2 className="text-xl font-semibold">Log in to save and manage entries</h2>
            <p className="text-stone-300 mt-2">Explore the interface freely, but saving requires login.</p>
            <Link href="/login" className="mt-4 inline-block px-5 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500">Go to Login</Link>
          </div>
        )}
        <div className="mb-8">
           <h1 className="text-4xl font-serif font-bold tracking-tight">Journal</h1>
           <p className="text-stone-300 mt-2">Write freely. Save memories, reflections, and thoughts for your future self.</p>
         </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="text-lg font-medium">{monthLabel}</div>
            <div className="flex gap-2">
              <button
                className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20"
                onClick={() => {
                  const d = new Date(monthRef);
                  d.setMonth(d.getMonth() - 1);
                  setMonthRef(d);
                  setSelectedDay(null);
                }}
              >
                ←
              </button>
              <button
                className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20"
                onClick={() => {
                  const d = new Date(monthRef);
                  d.setMonth(d.getMonth() + 1);
                  setMonthRef(d);
                  setSelectedDay(null);
                }}
              >
                →
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2 mt-4">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((w) => (
              <div key={w} className="text-xs text-stone-400 text-center">{w}</div>
            ))}
            {days.map(({ key, n }, i) => {
              const score = key ? moodByDay[key] : undefined;
              const color = !score ? 'rgba(255,255,255,0.18)' : score < 3 ? '#ef4444' : score === 3 ? '#f59e0b' : '#10b981';
              return (
                <button
                  key={`${key || 'x'}-${i}`}
                  disabled={!key}
                  onClick={() => setSelectedDay(key!)}
                  className={`h-20 rounded-xl border border-white/10 bg-white/5 p-2 flex flex-col items-center justify-between ${selectedDay === key ? 'ring-2 ring-indigo-500/50' : ''}`}
                >
                  <span className="text-sm text-stone-200">{n || ''}</span>
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ background: color }}
                    title={score ? `Mood ${score}` : 'No mood'}
                  />
                </button>
              );
            })}
          </div>
          {selectedDay && (
            <div className="mt-6">
              <div className="text-stone-400 uppercase tracking-widest text-xs mb-2">Entries on {selectedDay}</div>
              {dayEntries.length === 0 ? (
                <div className="text-stone-300 text-sm">No journal entry on this day.</div>
              ) : (
                <div className="space-y-3">
                  {dayEntries.map((e) => (
                    <div key={e.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="text-sm font-semibold text-stone-200">{e.title || 'Untitled'}</div>
                      {e.imageUrl?.trim() && (
                        <div className="mt-2 rounded-lg overflow-hidden border border-white/10">
                          <ImgWithFallback
                            src={e.imageUrl}
                            alt="Entry image"
                            className="object-contain w-full h-36"
                            fallbackText="Image not available"
                          />
                        </div>
                      )}
                      <div className="text-[11px] text-stone-500 mt-1 break-all">
                        Image URL: {e.imageUrl?.trim() ? <a href={e.imageUrl} target="_blank" rel="noreferrer" className="underline">{e.imageUrl}</a> : 'None'}
                      </div>
                      <div className="text-xs text-stone-400 mt-1">{String(e.content || '').slice(0, 120)}{String(e.content || '').length > 120 ? '…' : ''}</div>
                      <button
                        className="mt-2 text-indigo-300 hover:text-indigo-200 text-xs"
                        onClick={() => {
                          setDialogEntry(e);
                          setShowDialog(true);
                        }}
                      >
                        Open
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
 
         <div className="grid md:grid-cols-2 gap-8">
           <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6">
             <h2 className="text-xl font-semibold mb-4">New Entry</h2>
             <input
               value={title}
               onChange={(e) => setTitle(e.target.value)}
               placeholder="Title (optional)"
               className="w-full px-4 py-3 rounded-xl bg-stone-800 border border-stone-700 text-stone-200 placeholder-stone-400 mb-3"
             />
            <textarea
               value={content}
               onChange={(e) => setContent(e.target.value)}
               placeholder="What's on your mind?"
               rows={8}
               className="w-full px-4 py-3 rounded-xl bg-stone-800 border border-stone-700 text-stone-200 placeholder-stone-400"
             />
            <div className="mt-3">
              <label className="block text-sm text-stone-300 mb-1">Attach Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadImage(f);
                }}
                className="w-full px-4 py-3 rounded-xl bg-stone-800 border border-stone-700 text-stone-200 placeholder-stone-400"
              />
              {uploading && <div className="text-xs text-stone-400 mt-1">Uploading…</div>}
              {uploadError && <div className="text-xs text-red-400 mt-1">{uploadError}</div>}
            </div>
            <div className="mt-3 rounded-xl overflow-hidden border border-white/10">
              <ImgWithFallback
                src={imageUrl}
                alt="Preview"
                className="object-contain w-full h-48"
                fallbackText={imageUrl.trim() ? 'Image preview unavailable' : 'Paste an image URL to preview'}
              />
            </div>
             <div className="mt-4 flex items-center gap-3">
              <button onClick={addEntry} disabled={saving || !content.trim() || disabled} className="btn btn-primary disabled:opacity-60">
                 {saving ? 'Saving…' : 'Save Entry'}
               </button>
               <button
                onClick={() => { setTitle(''); setContent(''); setImageUrl(''); }}
                 className="px-4 py-3 rounded-xl bg-stone-800 border border-stone-700 text-stone-200 hover:bg-stone-700 transition"
               >
                 Clear
               </button>
             </div>
            {disabled && <div className="mt-2 text-stone-400 text-sm">Log in to save and manage your entries.</div>}
           </div>
 
           <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-0 overflow-hidden">
             <div className="flex items-center justify-between px-6 py-4">
               <h2 className="text-xl font-semibold">Your Entries</h2>
               {loading && <div className="text-stone-400 text-sm">Loading…</div>}
             </div>
             <div ref={containerRef} className="max-h-[60vh] overflow-auto px-6 pb-6 space-y-3">
               {entries.length === 0 && (
                 <div className="text-stone-400 text-sm">No entries yet. Your saved reflections will appear here.</div>
               )}
               {entries.map((e) => (
                 <div
                   key={e.id}
                   onClick={() => setSelectedId(e.id)}
                   className={`group rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/8 transition cursor-pointer ${selectedId === e.id ? 'ring-2 ring-indigo-500/50' : ''}`}
                 >
                   <div className="flex items-center justify-between">
                     <div className="font-medium">{e.title || 'Untitled'}</div>
                     <button
                       className="opacity-70 hover:opacity-100 text-stone-300 hover:text-red-300 transition text-sm"
                       onClick={(ev) => { ev.stopPropagation(); deleteEntry(e.id); }}
                     >
                       ✕
                     </button>
                   </div>
                  {e.imageUrl?.trim() && (
                    <div className="mt-2 rounded-lg overflow-hidden border border-white/10">
                      <ImgWithFallback
                        src={e.imageUrl}
                        alt="Entry image"
                        className="object-contain w-full h-36"
                        fallbackText="Image not available"
                      />
                    </div>
                  )}
                   <p className="text-stone-300 mt-1 line-clamp-2">{e.content}</p>
                   {e.createdAt && (
                     <div className="text-stone-500 text-xs mt-2">{new Date(e.createdAt).toLocaleString()}</div>
                   )}
                 </div>
               ))}
             </div>
           </div>
         </div>
 
        {selected && (
           <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6">
             <div className="text-stone-400 uppercase tracking-widest text-xs mb-2">Selected Entry</div>
             <h3 className="text-2xl font-serif mb-2">{selected.title || 'Untitled'}</h3>
            {selected.imageUrl?.trim() && (
              <div className="rounded-xl overflow-hidden border border-white/10 mb-4">
                <ImgWithFallback
                  src={selected.imageUrl}
                  alt="Entry image"
                  className="object-contain w-full h-64"
                  fallbackText="Image not available"
                />
              </div>
            )}
             <p className="text-stone-200 leading-relaxed whitespace-pre-wrap">{selected.content}</p>
           </div>
         )}
        {showDialog && dialogEntry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="bg-stone-900 border border-white/10 rounded-2xl w-full max-w-2xl p-6 relative">
              <button
                className="absolute top-3 right-3 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20"
                onClick={() => setShowDialog(false)}
                aria-label="Close dialog"
              >
                ✕
              </button>
              <div className="text-stone-400 uppercase tracking-widest text-xs mb-2">Journal Entry</div>
              <h3 className="text-2xl font-serif mb-2">{dialogEntry.title || 'Untitled'}</h3>
              {dialogEntry.createdAt && (
                <div className="text-stone-500 text-xs mb-3">{new Date(dialogEntry.createdAt).toLocaleString()}</div>
              )}
              {dialogEntry.imageUrl?.trim() && (
                <div className="rounded-xl overflow-hidden border border-white/10 mb-4">
                  <ImgWithFallback
                    src={dialogEntry.imageUrl}
                    alt="Entry image"
                    className="object-contain w-full h-64"
                    fallbackText="Image not available"
                  />
                </div>
              )}
              <div className="text-stone-200 leading-relaxed whitespace-pre-wrap">{dialogEntry.content}</div>
            </div>
          </div>
        )}
 
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6">
          <div>
            <div className="text-stone-400 uppercase tracking-widest text-xs">Photo Storyboard</div>
            <div className="text-2xl md:text-3xl font-serif mt-1">Act and Achieve</div>
            <div className="text-stone-300 text-sm mt-1">Images from {monthLabel}</div>
          </div>
          {storyboardImages.length === 0 ? (
            <div className="text-stone-400 text-sm mt-3">No images this month</div>
          ) : (
            <div className="relative mt-4 h-[420px] md:h-[520px] rounded-2xl bg-stone-900/40 border border-white/10 overflow-hidden">
              {storyboardImages.map((src, idx) => {
                const presets = [
                  { top: '6%', left: '6%', rot: -6, w: 180, h: 130, z: 2 },
                  { top: '10%', left: '28%', rot: 4, w: 220, h: 150, z: 3 },
                  { top: '4%', left: '58%', rot: -3, w: 200, h: 140, z: 2 },
                  { top: '22%', left: '12%', rot: 7, w: 190, h: 135, z: 4 },
                  { top: '26%', left: '42%', rot: -8, w: 230, h: 160, z: 5 },
                  { top: '22%', left: '72%', rot: 5, w: 180, h: 130, z: 3 },
                  { top: '48%', left: '8%', rot: -4, w: 210, h: 150, z: 2 },
                  { top: '52%', left: '34%', rot: 9, w: 200, h: 140, z: 4 },
                  { top: '50%', left: '60%', rot: -7, w: 220, h: 150, z: 3 },
                  { top: '62%', left: '78%', rot: 6, w: 160, h: 115, z: 2 },
                  { top: '74%', left: '28%', rot: -5, w: 180, h: 130, z: 3 },
                  { top: '76%', left: '54%', rot: 4, w: 190, h: 135, z: 2 },
                ];
                const p = presets[idx % presets.length];
                return (
                  <button
                    key={`${src}-${idx}`}
                    onClick={() => setStoryLightboxIndex(idx)}
                    style={{
                      position: 'absolute',
                      top: p.top,
                      left: p.left,
                      width: p.w,
                      height: p.h,
                      transform: `rotate(${p.rot}deg)`,
                      zIndex: p.z,
                    }}
                    className="rounded-xl overflow-hidden shadow-xl ring-1 ring-white/10 hover:scale-[1.03] transition"
                  >
                    <img src={src} alt="" className="object-cover w-full h-full" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
        {storyLightboxIndex !== null && storyboardImages[storyLightboxIndex] && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            <div className="relative w-full max-w-5xl p-4">
              <button
                className="absolute top-4 right-4 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20"
                onClick={() => setStoryLightboxIndex(null)}
                aria-label="Close"
              >
                ✕
              </button>
              <div className="flex items-center justify-between mb-3">
                <button
                  className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20"
                  onClick={() => setStoryLightboxIndex((i) => (i === null ? null : Math.max(0, i - 1)))}
                >
                  ←
                </button>
                <button
                  className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20"
                  onClick={() =>
                    setStoryLightboxIndex((i) =>
                      i === null ? null : Math.min(storyboardImages.length - 1, i + 1)
                    )
                  }
                >
                  →
                </button>
              </div>
              <div className="rounded-xl overflow-hidden border border-white/10 bg-stone-900">
                <img
                  src={storyboardImages[storyLightboxIndex]}
                  alt=""
                  className="object-contain w-full max-h-[80vh]"
                />
              </div>
            </div>
          </div>
        )}
         {flash && (
           <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
             <div className="px-6 py-3 rounded-full bg-green-600/80 text-white shadow-lg">{flash}</div>
           </div>
         )}
       </main>
     </div>
   );
 }
