 'use client';
 
import { useEffect, useRef, useState } from 'react';
 import toast from 'react-hot-toast';
import Link from 'next/link';
import { useUser } from '@/lib/contexts/UserContext';
import Image from 'next/image';
 
export default function Manifest() {
  const { user } = useUser();
   const videoRef = useRef<HTMLVideoElement | null>(null);
   const recorderRef = useRef<MediaRecorder | null>(null);
   const streamRef = useRef<MediaStream | null>(null);
   const chunksRef = useRef<BlobPart[]>([]);
   const timerRef = useRef<number | null>(null);
  const mimeRef = useRef<string>('video/webm');
 
   const [recording, setRecording] = useState(false);
   const [secondsLeft, setSecondsLeft] = useState(180);
  const [uploading, setUploading] = useState(false);
  const [videos, setVideos] = useState<Array<{ id: string; filename: string; uploadDate?: string; unlockAt?: string }>>([]);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [countdown, setCountdown] = useState<number | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState<string>('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [pendingBlob, setPendingBlob] = useState<Blob | null>(null);
  const [pendingFilename, setPendingFilename] = useState<string>('');
  const [unlockAt, setUnlockAt] = useState<string>('');
  const [durationSec, setDurationSec] = useState<number>(180);
  const [maxVideos, setMaxVideos] = useState<number>(3);
  function clearPreview() {
    const el = videoRef.current;
    if (el) {
      try {
        (el as any).srcObject = null;
        el.removeAttribute('src');
        el.load();
      } catch {}
    }
  }
 
   useEffect(() => {
     return () => {
       if (recorderRef.current && recorderRef.current.state !== 'inactive') {
         recorderRef.current.stop();
       }
       if (streamRef.current) {
         streamRef.current.getTracks().forEach((t) => t.stop());
       }
       if (timerRef.current) {
         window.clearInterval(timerRef.current);
       }
     };
   }, []);
 
  async function startRecording() {
     try {
      if (!user) {
        toast.error('Please log in to record videos');
        return;
      }
      const limit = await refreshMaxVideos();
      if (videos.length >= limit) {
        toast.error(`You can only keep up to ${limit} Manifest videos`);
        return;
      }
       if (!('MediaRecorder' in window)) {
         toast.error('MediaRecorder is not supported in this browser');
         return;
       }
       const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
       streamRef.current = stream;
       if (videoRef.current) {
         videoRef.current.srcObject = stream;
         videoRef.current.play().catch(() => {});
       }
 
      setCountdown(5);
      const countdownTimer = window.setInterval(() => {
        setCountdown((c) => {
          if (c && c > 1) return c - 1;
          window.clearInterval(countdownTimer);
          beginRecording();
          return null;
        });
      }, 1000);
     } catch (err: any) {
       console.error('startRecording error', err);
       toast.error(err?.message || 'Failed to start recording');
     }
   }
 
  function beginRecording() {
    if (!streamRef.current) return;
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const candidates = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=vp8',
      'video/webm',
    ];
    let selected = 'video/webm';
    try {
      for (const t of candidates) {
        // Some browsers may throw if isTypeSupported is not available
        if (typeof (window as any).MediaRecorder !== 'undefined' && (MediaRecorder as any).isTypeSupported?.(t)) {
          selected = t;
          break;
        }
      }
    } catch {}
    mimeRef.current = selected;
    const options: MediaRecorderOptions | undefined = selected ? { mimeType: selected } : undefined;
    const recorder = new MediaRecorder(streamRef.current, options as MediaRecorderOptions);
    recorderRef.current = recorder;
    chunksRef.current = [];
    recorder.ondataavailable = (e: BlobEvent) => {
      if (e.data && e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };
    recorder.onstop = async () => {
      clearRecordingState();
      const blob = new Blob(chunksRef.current, { type: mimeRef.current });
      setPendingBlob(blob.size > 0 ? blob : null);
      const fname = `manifest_${new Date().toISOString().replace(/[:.]/g, '-')}.webm`;
      setPendingFilename(fname);
      const d = new Date();
      d.setMonth(d.getMonth() + 1);
      const pad = (n: number) => String(n).padStart(2, '0');
      const local = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      setUnlockAt(local);
      setShowSaveModal(true);
    };
    recorder.start();
    setRecording(true);
    setSecondsLeft(durationSec);
    timerRef.current = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          if (recorderRef.current && recorderRef.current.state !== 'inactive') {
            recorderRef.current.stop();
          }
          clearRecordingState();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }
 
  function clearRecordingState() {
    setRecording(false);
    setCountdown(null);
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setSecondsLeft(180);
  }

   async function stopRecording() {
     if (recorderRef.current && recorderRef.current.state !== 'inactive') {
       recorderRef.current.stop();
     }
    clearRecordingState();
   }
 
  async function handleUpload(blobOverride?: Blob, filenameOverride?: string) {
     try {
      if (!user) {
        toast.error('Please log in to save videos');
        return;
      }
      const limit = await refreshMaxVideos();
      if (videos.length >= limit) {
        toast.error(`You can only keep up to ${limit} Manifest videos`);
        return;
      }
       setUploading(true);
      const blob = blobOverride || new Blob(chunksRef.current, { type: mimeRef.current });
       if (blob.size === 0) {
         setUploading(false);
         toast.error('No video captured');
         return;
       }
      const fd = new FormData();
      const filename = filenameOverride || `manifest_${new Date().toISOString().replace(/[:.]/g, '-')}.webm`;
       fd.append('file', blob, filename);
      fd.append('contentType', mimeRef.current);
      fd.append('unlockAt', unlockAt);
 
       const res = await fetch('/api/manifest/upload', {
         method: 'POST',
        body: fd,
        credentials: 'same-origin',
       });
       if (!res.ok) {
         const data = await res.json().catch(() => ({}));
         throw new Error(data?.error || 'Upload failed');
       }
       const data = await res.json();
       toast.success('Video saved');
       console.log('Saved video id:', data.id);
      setVideos((prev) => [{ id: data.id, filename: data.filename, uploadDate: new Date().toISOString(), unlockAt: unlockAt || undefined }, ...prev]);
      setSecondsLeft(durationSec);
     } catch (err: any) {
       console.error('upload error', err);
       toast.error(err?.message || 'Failed to upload video');
     } finally {
       setUploading(false);
       chunksRef.current = [];
      setPendingBlob(null);
      setPendingFilename('');
      setShowSaveModal(false);
      clearPreview();
     }
   }
 
  async function loadVideos() {
    try {
      const res = await fetch('/api/manifest/list', { cache: 'no-store', credentials: 'same-origin' });
      if (!res.ok) throw new Error('Failed to load videos');
      const data = await res.json();
      setVideos((data.items || []).map((it: any) => ({
        id: it.id,
        filename: it.filename,
        uploadDate: it.uploadDate,
        unlockAt: it.unlockAt ? String(it.unlockAt) : undefined,
      })));
    } catch (err: any) {
      console.error('list error', err);
    }
  }

  useEffect(() => {
    loadVideos();
    // Fetch manifest config (max videos)
    (async () => {
      try {
        const res = await fetch('/api/manifest/config', { cache: 'no-store', credentials: 'include' });
        const data = await res.json();
        if (typeof data?.maxVideos === 'number') {
          setMaxVideos(data.maxVideos);
        }
      } catch {}
    })();
  }, []);

  async function refreshMaxVideos(): Promise<number> {
    try {
      const res = await fetch('/api/manifest/config', { cache: 'no-store', credentials: 'include' });
      const data = await res.json();
      if (typeof data?.maxVideos === 'number') {
        setMaxVideos(data.maxVideos);
        return data.maxVideos;
      }
      return maxVideos;
    } catch {
      return maxVideos;
    }
  }

  async function deleteVideo(id: string) {
    try {
      setDeletingIds((prev) => new Set([...prev, id]));
      const previous = [...videos];
      setVideos((prev) => prev.filter((v) => v.id !== id));
      const res = await fetch(`/api/manifest/file/${id}`, { method: 'DELETE', credentials: 'same-origin', cache: 'no-store' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Delete failed');
      }
      toast.success('Deleted');
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      await loadVideos(); // resync to server state
    } catch (err: any) {
      // Revert optimistic removal
      setVideos(previous);
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast.error(err?.message || 'Failed to delete');
    } finally {
      // no-op
    }
  }
 
  async function saveRename(id: string) {
    try {
      const name = renameValue.trim();
      if (!name) {
        toast.error('Enter a name');
        return;
      }
      const res = await fetch(`/api/manifest/file/${id}/rename`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: name }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Rename failed');
      }
      const data = await res.json();
      setVideos((prev) => prev.map((v) => (v.id === id ? { ...v, filename: data.filename || name } : v)));
      setRenamingId(null);
      setRenameValue('');
      toast.success('Renamed');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to rename');
    }
  }

   return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0">
          <Image
            src="https://spiritualsync.com/wp-content/uploads/2024/01/Guided_Meditation_for_Manifestation_4f9c19ea-2a53-4e58-95b2-ace632fed8ae.png"
            alt="Manifest"
            fill
            className="object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 via-stone-900/60 to-rose-900/50" />
        </div>
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <div className="text-stone-300 uppercase tracking-widest text-sm mb-3">Speak To Future You</div>
          <h1 className="text-4xl md:text-6xl font-serif">Manifest</h1>
          <p className="text-stone-300 mt-3">Record brief messages and intentions for your future self.</p>
        </div>
      </section>
      <div className="max-w-4xl mx-auto px-6 py-10">
        {!user && (
          <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 text-center">
            <h2 className="text-xl font-semibold">Log in to save, rename, or delete videos</h2>
            <p className="text-neutral-300 mt-2">You can preview recording, but saving actions require login.</p>
            <Link href="/login" className="mt-4 inline-block px-5 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500">Go to Login</Link>
          </div>
        )}
        <h1 className="text-4xl font-bold tracking-tight">Manifest</h1>
        <p className="text-neutral-300 mt-3">
          Create short messages to your future self. Record moments, intentions, and reflections you can revisit later.
        </p>
 
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl overflow-hidden border border-neutral-800 bg-black shadow-lg shadow-black/40">
            <div className="relative">
              <video ref={videoRef} className="w-full h-[60vh] object-cover" playsInline muted />
              {countdown !== null && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <div className="text-7xl font-bold animate-pulse">{countdown}</div>
                </div>
              )}
            </div>
           </div>
           <div className="flex flex-col gap-4">
            <div className="text-6xl font-mono">{Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}</div>
            <div className="flex gap-2 items-center">
              <span className="text-sm text-neutral-400">Duration:</span>
              {[
                { label: '1 min', val: 60 },
                { label: '3 min', val: 180 },
                { label: '5 min', val: 300 },
              ].map((opt) => (
                <button
                  key={opt.val}
                  className={`px-3 py-1 rounded ${durationSec === opt.val ? 'bg-indigo-600 text-white' : 'bg-stone-800 text-stone-200 hover:bg-stone-700'}`}
                  onClick={() => {
                    setDurationSec(opt.val);
                    if (!recording && countdown === null) {
                      setSecondsLeft(opt.val);
                    }
                  }}
                  disabled={recording || uploading}
                >
                  {opt.label}
                </button>
              ))}
            </div>
             <div className="flex gap-3">
               <button
                className="px-5 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition-all"
                 onClick={startRecording}
                 disabled={recording || uploading}
               >
                {countdown !== null ? 'Preparing…' : 'Start'}
               </button>
               <button
                className="px-5 py-3 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 transition-all"
                 onClick={stopRecording}
                 disabled={!recording}
               >
                 Stop
               </button>
              {countdown !== null && (
                <button
                  className="px-5 py-3 rounded-lg bg-stone-700 hover:bg-stone-600 transition-all"
                  onClick={() => {
                    setCountdown(null);
                    if (streamRef.current) {
                      streamRef.current.getTracks().forEach((t) => t.stop());
                      streamRef.current = null;
                    }
                  }}
                >
                  Cancel
                </button>
              )}
             </div>
             <div className="text-sm text-neutral-400">
              {uploading
                ? 'Uploading…'
                : user
                ? `You can keep up to ${maxVideos} videos for ${user.email}.`
                : 'Log in to record and save your video to your account.'}
             </div>
            <div className="mt-4 rounded-xl border border-neutral-800 p-4 bg-neutral-900/50">
              <h3 className="text-lg font-semibold">About Manifest</h3>
              <p className="text-neutral-300 mt-2">
                This feature lets you send a message to your future self and see how your thoughts were at that time.
                It can also be used to record your goals so your future self can see how many were accomplished.
              </p>
              <ul className="mt-3 text-neutral-300 list-disc list-inside">
                <li>Choose duration: 1 min, 3 min, or 5 min</li>
                <li>Auto-stop when time ends and prompt to save</li>
                <li>Unlock date is required; default is 1 month later</li>
                <li>Saved privately to your account (max ${maxVideos} videos)</li>
              </ul>
            </div>
           </div>
         </div>
        
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Your Manifest Videos</h2>
          {videos.length === 0 ? (
            <p className="text-neutral-400">No videos yet.</p>
          ) : (
            <div className="grid gap-6">
              {videos.map((v) => (
               <div key={v.id} className="border border-neutral-800 rounded-xl p-4 bg-neutral-900 relative overflow-hidden">
                 {deletingIds.has(v.id) && (
                   <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                     <div className="text-sm px-4 py-2 rounded-lg bg-stone-800 text-stone-200">Deleting…</div>
                   </div>
                 )}
                  <div className="flex items-center justify-between mb-3">
                   <div className="text-sm text-neutral-300 flex items-center gap-2">
                     {renamingId === v.id ? (
                       <>
                         <input
                           className="px-2 py-1 rounded bg-stone-800 text-stone-200 border border-stone-700"
                           value={renameValue}
                           onChange={(e) => setRenameValue(e.target.value)}
                         />
                         <button
                           className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white"
                            onClick={() => {
                              if (!user) {
                                toast.error('Please log in to rename videos');
                                return;
                              }
                              saveRename(v.id);
                            }}
                            disabled={!user}
                         >
                           Save
                         </button>
                         <button
                           className="px-3 py-1 rounded bg-stone-700 hover:bg-stone-600 text-stone-200"
                           onClick={() => {
                             setRenamingId(null);
                             setRenameValue('');
                           }}
                         >
                           Cancel
                         </button>
                       </>
                     ) : (
                       <>
                         <span className="font-medium">{v.filename}</span>
                         <button
                           className="text-xs px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200"
                           onClick={() => {
                             setRenamingId(v.id);
                             setRenameValue(v.filename);
                           }}
                            disabled={!user}
                         >
                           Rename
                         </button>
                       </>
                     )}
                     <span className="text-neutral-500">
                       • {v.uploadDate ? new Date(v.uploadDate).toLocaleString() : ''}
                     </span>
                   </div>
                    <button
                      onClick={() => {
                        if (!user) {
                          toast.error('Please log in to delete videos');
                          return;
                        }
                        deleteVideo(v.id);
                      }}
                     className="text-sm px-3 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200"
                     disabled={deletingIds.has(v.id)}
                    >
                      Delete
                    </button>
                  </div>
                  {v.unlockAt && new Date(v.unlockAt).getTime() > Date.now() ? (
                    <div className="w-full aspect-video rounded border border-neutral-800 bg-neutral-900/50 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl mb-1">🔒 Locked</div>
                        <div className="text-neutral-300 text-sm">Available on {new Date(v.unlockAt).toLocaleString()}</div>
                      </div>
                    </div>
                  ) : (
                    <video
                      className="w-full aspect-video rounded"
                      controls
                      preload="metadata"
                      playsInline
                      src={`/api/manifest/file/${v.id}`}
                      onEnded={(e) => {
                        try {
                          const vid = e.currentTarget;
                          vid.pause();
                          vid.currentTime = 0;
                        } catch {}
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
       </div>
      {showSaveModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl">
            <div className="p-6">
              <h3 className="text-xl font-semibold">Save Recording?</h3>
              <p className="text-neutral-300 mt-2">
                Name your video and choose to save or discard. Saved videos appear in your Manifest list.
              </p>
              <div className="mt-4">
                <label className="block text-sm text-neutral-400 mb-1">Filename</label>
                <input
                  className="w-full px-3 py-2 rounded-lg bg-stone-800 text-stone-200 border border-stone-700"
                  value={pendingFilename}
                  onChange={(e) => setPendingFilename(e.target.value)}
                />
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500"
                  onClick={() => handleUpload(pendingBlob || undefined, pendingFilename)}
                  disabled={uploading || !pendingBlob || !user || !unlockAt}
                >
                  {uploading ? 'Saving…' : 'Save'}
                </button>
                <div className="flex-1" />
                <button
                  className="px-5 py-2 rounded-lg bg-stone-700 hover:bg-stone-600 text-stone-200"
                  onClick={() => {
                    setShowSaveModal(false);
                    setPendingBlob(null);
                    setPendingFilename('');
                    chunksRef.current = [];
                    toast('Recording discarded', { icon: '🗑️' });
                    setSecondsLeft(durationSec);
                    clearPreview();
                  }}
                >
                  Discard
                </button>
              </div>
              <div className="mt-4">
                <label className="block text-sm text-neutral-400 mb-1">Unlock on</label>
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2 rounded-lg bg-stone-800 text-stone-200 border border-stone-700"
                  value={unlockAt}
                  onChange={(e) => setUnlockAt(e.target.value)}
                />
                <p className="text-neutral-500 text-xs mt-2">Required. Default is 1 month later; adjust as you wish.</p>
              </div>
            </div>
          </div>
        </div>
      )}
     </div>
   );
 }
