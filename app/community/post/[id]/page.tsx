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

  function MarkdownContent({ content }: { content: string }) {
    const [blocks, setBlocks] = useState<Array<any>>([]);
    useEffect(() => {
      const lines = (content || '').split(/\r?\n/);
      const out: Array<any> = [];
      let inCode = false;
      let codeBuf: string[] = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim().startsWith('```')) {
          if (!inCode) {
            inCode = true;
            codeBuf = [];
          } else {
            inCode = false;
            out.push({ type: 'code', text: codeBuf.join('\n') });
            codeBuf = [];
          }
          continue;
        }
        if (inCode) {
          codeBuf.push(line);
          continue;
        }
        if (/^\s*#{1,6}\s+/.test(line)) {
          const level = (line.match(/^\s*(#+)\s+/) || ['','#'])[1].length;
          const text = line.replace(/^\s*#{1,6}\s+/, '');
          out.push({ type: 'heading', level, text });
          continue;
        }
        if (/^\s*[-*]\s+/.test(line)) {
          const text = line.replace(/^\s*[-*]\s+/, '');
          out.push({ type: 'list-item', text });
          continue;
        }
        if (/^\s*\d+\.\s+/.test(line)) {
          const text = line.replace(/^\s*\d+\.\s+/, '');
          out.push({ type: 'list-item', text });
          continue;
        }
        if (line.trim().length === 0) {
          out.push({ type: 'break' });
          continue;
        }
        out.push({ type: 'paragraph', text: line });
      }
      setBlocks(out);
    }, [content]);
    function renderInline(t: string) {
      const parts: Array<any> = [];
      let rest = t;
      const linkRegex = /(https?:\/\/[^\s)]+)/g;
      let lastIndex = 0;
      const matches = Array.from(rest.matchAll(linkRegex));
      if (matches.length === 0) return t;
      matches.forEach((m, idx) => {
        const start = m.index || 0;
        const end = start + m[0].length;
        if (start > lastIndex) parts.push(rest.slice(lastIndex, start));
        parts.push(<a key={`lnk-${idx}`} href={m[0]} className="text-primary-400 underline break-words">{m[0]}</a>);
        lastIndex = end;
      });
      if (lastIndex < rest.length) parts.push(rest.slice(lastIndex));
      return parts;
    }
    let listOpen = false;
    const nodes: Array<any> = [];
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      if (b.type === 'list-item') {
        if (!listOpen) {
          listOpen = true;
          nodes.push(<ul key={`ul-${i}`} className="list-disc pl-6 space-y-1" />);
        }
        const ul = nodes[nodes.length - 1];
        nodes[nodes.length - 1] = (
          <ul key={ul.key} className="list-disc pl-6 space-y-1">
            {(ul as any).props?.children}
            <li key={`li-${i}`} className="text-stone-200">{renderInline(b.text)}</li>
          </ul>
        );
        continue;
      } else if (listOpen) {
        listOpen = false;
      }
      if (b.type === 'code') {
        nodes.push(
          <pre key={`code-${i}`} className="bg-stone-800 text-stone-200 p-4 rounded-xl overflow-auto border border-white/10">
            <code>{b.text}</code>
          </pre>
        );
      } else if (b.type === 'heading') {
        const size = b.level <= 2 ? 'text-2xl' : b.level === 3 ? 'text-xl' : 'text-lg';
        nodes.push(<div key={`h-${i}`} className={`font-serif ${size} text-stone-100 mt-4 mb-2`}>{renderInline(b.text)}</div>);
      } else if (b.type === 'paragraph') {
        nodes.push(<p key={`p-${i}`} className="text-stone-200 leading-relaxed">{renderInline(b.text)}</p>);
      } else if (b.type === 'break') {
        nodes.push(<div key={`br-${i}`} className="h-2" />);
      }
    }
    return <div className="space-y-3">{nodes}</div>;
  }
  function LinkPreviews({ content }: { content: string }) {
    const [previews, setPreviews] = useState<Record<string, { title: string; description: string; image: string }>>({});
    useEffect(() => {
      const urls = Array.from((content || '').matchAll(/https?:\/\/[^\s)]+/g)).map((m) => m[0]);
      const uniq = Array.from(new Set(urls)).slice(0, 5);
      let active = true;
      (async () => {
        for (const u of uniq) {
          try {
            const r = await fetch(`/api/link-preview?url=${encodeURIComponent(u)}`, { cache: 'no-store' }).then((x) => x.json());
            if (!active) return;
            if (r && !r.error) {
              setPreviews((prev) => ({ ...prev, [u]: { title: r.title || u, description: r.description || '', image: r.image || '' } }));
            }
          } catch {}
        }
      })();
      return () => { active = false; };
    }, [content]);
    const keys = Object.keys(previews);
    if (keys.length === 0) return null;
    return (
      <div className="mt-6 space-y-3">
        {keys.map((u) => {
          const p = previews[u];
          return (
            <a key={u} href={u} className="block rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4 hover:bg-white/7 transition">
              {p.image ? <img src={p.image} alt={p.title} className="w-full h-40 object-cover rounded-lg mb-2 border border-white/10" /> : null}
              <div className="text-lg font-serif">{p.title}</div>
              {p.description ? <div className="text-stone-300 text-sm">{p.description}</div> : null}
              <div className="text-stone-500 text-xs mt-1 break-words">{u}</div>
            </a>
          );
        })}
      </div>
    );
  }
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
                <img src={post.imageUrl} alt={post.imageAlt || post.title} className="w-full max-h-[28rem] object-cover rounded-xl border border-white/10" />
                {post.imageCaption ? <div className="text-stone-400 text-xs mt-1">{post.imageCaption}</div> : null}
              </div>
            ) : (
              <div className="mb-4 w-full h-48 rounded-xl border border-white/10 bg-stone-800/60 flex items-center justify-center text-stone-300">
                Image unavailable
              </div>
            )}
            <div className="text-stone-500 text-xs mb-2">{post.imageUrl && post.imageUrl.trim() ? `imageUrl: ${post.imageUrl}` : 'imageUrl: none'}</div>
            <MarkdownContent content={post.content} />
            <LinkPreviews content={post.content} />
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
