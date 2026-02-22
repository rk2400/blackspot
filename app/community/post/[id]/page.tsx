'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/lib/contexts/UserContext';
import toast from 'react-hot-toast';
import { getCommunityPost, getCommunityComments, addCommunityComment, toggleCommunityLike, deleteCommunityPost, deleteCommunityComment } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

export default function PostPage({ params }: { params: { id: string } }) {
  const { user } = useUser();
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [topic, setTopic] = useState<any>(null);
  const [likeCount, setLikeCount] = useState<number>(0);
  const [comments, setComments] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [saving, setSaving] = useState(false);
  const [liking, setLiking] = useState(false);
  const canDeletePost = user && post?.author?._id && String(post.author._id) === String(user.id);

  const load = async () => {
    try {
      const d = await getCommunityPost(params.id);
      setPost(d.post);
      setTopic(d.topic);
      setLikeCount(d.likeCount);
      const c = await getCommunityComments(params.id);
      setComments(c);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  return (
    <div className="min-h-screen bg-stone-900 text-white">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/community" className="text-stone-300 hover:text-stone-200">← Community</Link>
            {topic?.slug && (
              <Link href={`/community/${topic.slug}`} className="text-stone-300 hover:text-stone-200">· {topic.title}</Link>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-stone-300">Loading...</div>
        ) : !post ? (
          <div className="text-stone-300">Post not found.</div>
        ) : (
          <>
            <h1 className="text-3xl font-serif mb-1">{post.title}</h1>
            <div className="text-stone-400 text-sm mb-3">
              {(post.author?.name?.trim() ? post.author.name : post.author?.email) ? `by ${post.author?.name?.trim() ? post.author.name : post.author?.email}` : ''}
            </div>
            {post.imageUrl && post.imageUrl.trim() ? (
              <div className="mb-4">
                <img src={post.imageUrl} alt={post.title} className="w-full max-h-[28rem] object-cover rounded-xl border border-white/10" />
              </div>
            ) : (
              <div className="mb-4 w-full h-48 rounded-xl border border-white/10 bg-stone-800/60 flex items-center justify-center text-stone-300">
                Image unavailable
              </div>
            )}
            <div className="text-stone-500 text-xs mb-2">{post.imageUrl && post.imageUrl.trim() ? `imageUrl: ${post.imageUrl}` : 'imageUrl: none'}</div>
            <div className="text-stone-200 leading-relaxed whitespace-pre-wrap">{post.content}</div>
            <div className="mt-4 flex items-center gap-3">
              <button
                className="btn btn-secondary"
                disabled={liking}
                onClick={async () => {
                  try {
                    setLiking(true);
                    const r = await toggleCommunityLike(params.id);
                    setLikeCount(r.likeCount);
                  } catch (e: any) {
                    toast.error(e.message || 'Failed to like');
                  } finally {
                    setLiking(false);
                  }
                }}
              >
                ❤️ {likeCount}
              </button>
              {canDeletePost && (
                <button
                  className="btn btn-secondary"
                  onClick={async () => {
                    try {
                      await deleteCommunityPost(params.id);
                      toast.success('Post deleted');
                      if (topic?.slug) {
                        router.push(`/community/${topic.slug}`);
                      } else {
                        router.push('/community');
                      }
                    } catch (e: any) {
                      toast.error(e.message || 'Failed to delete post');
                    }
                  }}
                >
                  Delete Post
                </button>
              )}
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6">
              <h2 className="text-xl font-semibold mb-4">Comments</h2>
              <div className="space-y-4 mb-4">
                {comments.length === 0 ? (
                  <div className="text-stone-300">No comments yet.</div>
                ) : (
                  comments.map((c, i) => {
                    const authorLabel = c.author?.name?.trim() ? c.author.name : c.author?.email;
                    const canDelete = user && c.author?._id && String(c.author._id) === String(user.id);
                    return (
                      <div key={i} className="rounded-xl border border-white/10 bg-white/3 p-4">
                        <div className="text-stone-400 text-xs mb-2">{authorLabel ? `by ${authorLabel}` : ''}</div>
                        <div className="text-stone-200 whitespace-pre-wrap">{c.content}</div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="text-stone-400 text-xs">{new Date(c.createdAt).toLocaleString()}</div>
                          {canDelete && (
                            <button
                              className="btn btn-secondary btn-xs"
                              onClick={async () => {
                                try {
                                  await deleteCommunityComment(params.id, String(c._id));
                                  setComments((prev) => prev.filter((x) => String(x._id) !== String(c._id)));
                                  toast.success('Comment deleted');
                                } catch (e: any) {
                                  toast.error(e.message || 'Failed to delete comment');
                                }
                              }}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {user ? (
                <div>
                  <textarea
                    className="input h-24"
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <div className="mt-3">
                    <button
                      className="btn btn-primary"
                      disabled={saving || !commentText.trim()}
                      onClick={async () => {
                        try {
                          setSaving(true);
                          await addCommunityComment(params.id, commentText.trim());
                          setCommentText('');
                          const c = await getCommunityComments(params.id);
                          setComments(c);
                          toast.success('Comment added');
                        } catch (e: any) {
                          toast.error(e.message || 'Failed to add comment');
                        } finally {
                          setSaving(false);
                        }
                      }}
                    >
                      {saving ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-stone-300">Log in to comment.</div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
