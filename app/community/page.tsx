'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/lib/contexts/UserContext';
import toast from 'react-hot-toast';
import { getCommunityTopics, createCommunityTopic, deleteCommunityTopic, uploadCommunityImage, getCommunityFeeds } from '@/lib/api-client';

export default function CommunityPage() {
  const { user } = useUser();
  const [topics, setTopics] = useState<Array<{ title: string; slug: string; description?: string; imageUrl?: string; createdBy?: { _id: string; name?: string; email?: string } }>>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [feeds, setFeeds] = useState<{ trending: Array<any>; mostDiscussed: Array<any> } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const list = await getCommunityTopics();
        setTopics(list);
      } catch (e: any) {
        toast.error(e.message || 'Failed to load topics');
      } finally {
        setLoading(false);
      }
      try {
        const f = await getCommunityFeeds();
        setFeeds(f);
      } catch (e: any) {
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-stone-900 text-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-serif">Community</h1>
          <p className="text-stone-300 mt-2">Explore topics and share reflections with others.</p>
        </div>
        {feeds ? (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-serif mb-4">Trending</h2>
              <div className="space-y-4">
                {feeds.trending.length === 0 ? (
                  <div className="text-stone-300">No trending posts yet.</div>
                ) : (
                  feeds.trending.map((p, i) => (
                    <Link key={String(p._id) + i} href={`/community/post/${String(p._id)}`} className="block rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4 hover:bg-white/7 transition">
                      {p.imageUrl && p.imageUrl.trim() ? (
                        <img src={p.imageUrl} alt={p.imageAlt || p.title} className="w-full h-36 object-cover rounded-lg mb-2 border border-white/10" />
                      ) : null}
                      <div className="text-lg font-serif">{p.title}</div>
                      <div className="text-stone-400 text-sm">{Array.isArray(p.likes) ? p.likes.length : 0} likes</div>
                    </Link>
                  ))
                )}
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-serif mb-4">Most Discussed</h2>
              <div className="space-y-4">
                {feeds.mostDiscussed.length === 0 ? (
                  <div className="text-stone-300">No discussions yet.</div>
                ) : (
                  feeds.mostDiscussed.map((p, i) => (
                    <Link key={String(p._id) + i} href={`/community/post/${String(p._id)}`} className="block rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4 hover:bg-white/7 transition">
                      {p.imageUrl && p.imageUrl.trim() ? (
                        <img src={p.imageUrl} alt={p.imageAlt || p.title} className="w-full h-36 object-cover rounded-lg mb-2 border border-white/10" />
                      ) : null}
                      <div className="text-lg font-serif">{p.title}</div>
                      <div className="text-stone-400 text-sm">{p.commentCount || 0} comments</div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : null}

        {user && (
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Create a Topic</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                className="input"
                placeholder="Topic title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <input
                className="input"
                placeholder="Short description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  try {
                    setUploadError(null);
                    setUploading(true);
                    const r = await uploadCommunityImage(f);
                    setImageUrl(r.url || '');
                    toast.success('Image uploaded');
                  } catch (err: any) {
                    setUploadError(err?.message || 'Upload failed');
                    toast.error(err?.message || 'Upload failed');
                  } finally {
                    setUploading(false);
                  }
                }}
                className="input"
              />
              {imageUrl ? (
                <div className="mt-3">
                  <img src={imageUrl} alt="Topic image" className="max-h-40 rounded-lg border border-white/10" />
                </div>
              ) : null}
              {uploading ? <div className="text-stone-300 mt-2">Uploading...</div> : null}
              {uploadError ? <div className="text-red-400 mt-2">{uploadError}</div> : null}
            </div>
            <button
              className="btn btn-primary"
              disabled={creating || !title.trim()}
              onClick={async () => {
                try {
                  setCreating(true);
                  const t = await createCommunityTopic(title.trim(), description.trim(), imageUrl || undefined);
                  toast.success('Topic created');
                  setTitle('');
                  setDescription('');
                  setImageUrl('');
                  const list = await getCommunityTopics();
                  setTopics(list);
                } catch (e: any) {
                  toast.error(e.message || 'Failed to create topic');
                } finally {
                  setCreating(false);
                }
              }}
            >
              {creating ? 'Creating...' : 'Create Topic'}
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-3 text-stone-300">Loading topics...</div>
          ) : topics.length === 0 ? (
            <div className="col-span-3 text-stone-300">No topics yet.</div>
          ) : (
            topics.map((t) => {
              const creator = t.createdBy?.name?.trim() ? t.createdBy?.name : t.createdBy?.email;
              const canDelete = user && t.createdBy?._id && String(t.createdBy._id) === String(user.id);
              return (
                <div
                  key={t.slug}
                  className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 hover:bg-white/7 transition"
                >
                  <Link href={`/community/${t.slug}`} className="block">
                    {t.imageUrl && t.imageUrl.trim() ? (
                      <img src={t.imageUrl} alt={t.title} className="w-full h-40 object-cover rounded-lg mb-3 border border-white/10" />
                    ) : (
                      <div className="w-full h-40 rounded-lg mb-3 border border-white/10 bg-stone-800/60 flex items-center justify-center text-stone-300">
                        Image unavailable
                      </div>
                    )}
                    <div className="text-stone-500 text-xs mb-2">{t.imageUrl && t.imageUrl.trim() ? `imageUrl: ${t.imageUrl}` : 'imageUrl: none'}</div>
                    <div className="text-2xl font-serif mb-1">{t.title}</div>
                    <div className="text-stone-400 text-sm mb-2">{creator ? `by ${creator}` : ''}</div>
                    <div className="text-stone-300">{t.description || 'Join the discussion.'}</div>
                  </Link>
                  {canDelete && (
                    <div className="mt-4">
                      <button
                        className="btn btn-secondary"
                        onClick={async () => {
                          try {
                            await deleteCommunityTopic(t.slug);
                            setTopics((prev) => prev.filter((x) => x.slug !== t.slug));
                            toast.success('Topic deleted');
                          } catch (e: any) {
                            toast.error(e.message || 'Failed to delete topic');
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
