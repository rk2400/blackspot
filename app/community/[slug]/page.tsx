'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/lib/contexts/UserContext';
import toast from 'react-hot-toast';
import { getCommunityPosts, createCommunityPost, deleteCommunityPost, uploadCommunityImage } from '@/lib/api-client';

export default function TopicPage({ params }: { params: { slug: string } }) {
  const { user } = useUser();
  const [topic, setTopic] = useState<{ title: string; slug: string; imageUrl?: string } | null>(null);
  const [posts, setPosts] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await getCommunityPosts(params.slug);
      setTopic(data.topic);
      setPosts(data.posts || []);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.slug]);

  return (
    <div className="min-h-screen bg-stone-900 text-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <Link href="/community" className="text-stone-300 hover:text-stone-200">← Back to Community</Link>
        </div>
        <div className="mb-8">
          {topic?.imageUrl ? (
            <div className="mb-6">
              <img
                src={topic.imageUrl}
                alt={topic.title}
                className="w-full h-56 md:h-72 object-cover rounded-2xl border border-white/10"
              />
            </div>
          ) : null}
          <h1 className="text-4xl font-serif">{topic?.title || 'Topic'}</h1>
          <p className="text-stone-300 mt-2">Share a new post or join existing discussions.</p>
        </div>

        {user && (
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Start a Discussion</h2>
            <input
              className="input mb-3"
              placeholder="Post title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              className="input h-28"
              placeholder="Write your thoughts..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="mt-3">
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
                  <img src={imageUrl} alt="Post image" className="max-h-40 rounded-lg border border-white/10" />
                </div>
              ) : null}
              {uploading ? <div className="text-stone-300 mt-2">Uploading...</div> : null}
              {uploadError ? <div className="text-red-400 mt-2">{uploadError}</div> : null}
            </div>
            <div className="mt-4">
              <button
                className="btn btn-primary"
                disabled={creating || !title.trim() || !content.trim()}
                onClick={async () => {
                  try {
                    setCreating(true);
                    await createCommunityPost(params.slug, title.trim(), content.trim(), imageUrl || undefined);
                    setTitle('');
                    setContent('');
                    setImageUrl('');
                    toast.success('Post created');
                    await load();
                  } catch (e: any) {
                    toast.error(e.message || 'Failed to create post');
                  } finally {
                    setCreating(false);
                  }
                }}
              >
                {creating ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {loading ? (
            <div className="text-stone-300">Loading posts...</div>
          ) : posts.length === 0 ? (
            <div className="text-stone-300">No posts yet.</div>
          ) : (
            posts.map((p) => {
              const authorLabel = p.author?.name?.trim() ? p.author.name : p.author?.email;
              const canDelete = user && p.author?._id && String(p.author._id) === String(user.id);
              return (
                <div
                  key={String(p._id)}
                  className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 hover:bg-white/7 transition"
                >
                  <Link href={`/community/post/${String(p._id)}`} className="block">
                        {p.imageUrl && p.imageUrl.trim() ? (
                          <img src={p.imageUrl} alt={p.title} className="w-full h-48 object-cover rounded-lg mb-3 border border-white/10" />
                        ) : (
                          <div className="w-full h-48 rounded-lg mb-3 border border-white/10 bg-stone-800/60 flex items-center justify-center text-stone-300">
                            Image unavailable
                          </div>
                        )}
                        <div className="text-stone-500 text-xs mb-2">{p.imageUrl && p.imageUrl.trim() ? `imageUrl: ${p.imageUrl}` : 'imageUrl: none'}</div>
                    <div className="text-xl font-serif mb-1">{p.title}</div>
                    <div className="text-stone-400 text-sm mb-2">{authorLabel ? `by ${authorLabel}` : ''}</div>
                    <div className="text-stone-300 line-clamp-3">{p.content}</div>
                    <div className="text-stone-400 text-sm mt-2">{Array.isArray(p.likes) ? p.likes.length : 0} likes</div>
                  </Link>
                  {canDelete && (
                    <div className="mt-4">
                      <button
                        className="btn btn-secondary"
                        onClick={async () => {
                          try {
                            await deleteCommunityPost(String(p._id));
                            setPosts((prev) => prev.filter((x) => String(x._id) !== String(p._id)));
                            toast.success('Post deleted');
                          } catch (e: any) {
                            toast.error(e.message || 'Failed to delete post');
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
