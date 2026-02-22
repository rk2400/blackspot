'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/lib/contexts/UserContext';
import { getAdminStats } from '@/lib/api-client';
import Link from 'next/link';
import toast from 'react-hot-toast';
import AdminHeader from '@/components/AdminHeader';

export default function AdminDashboardPage() {
  const { user } = useUser();
  const [stats, setStats] = useState<null | Awaited<ReturnType<typeof getAdminStats>>>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const s = await getAdminStats();
        setStats(s);
      } catch (e: any) {
        toast.error(e.message || 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const isAdmin = (user as any)?.isAdmin;

  return (
    <div className="min-h-screen bg-stone-900 text-white">
      <AdminHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-serif mb-6">Admin Dashboard</h1>
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/admin/users" className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4 hover:bg-white/10 transition">
            <div className="text-stone-300 text-sm">Manage</div>
            <div className="text-xl font-serif">Users</div>
          </Link>
          <Link href="/admin/emails" className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4 hover:bg-white/10 transition">
            <div className="text-stone-300 text-sm">Configure</div>
            <div className="text-xl font-serif">Email Templates</div>
          </Link>
          <Link href="/" className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4 hover:bg-white/10 transition">
            <div className="text-stone-300 text-sm">View</div>
            <div className="text-xl font-serif">Site</div>
          </Link>
        </div>
        {!isAdmin ? (
          <div className="text-red-400">You must be an admin to view this page.</div>
        ) : loading ? (
          <div className="text-stone-300">Loading stats...</div>
        ) : !stats ? (
          <div className="text-stone-300">No stats.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6">
              <div className="text-stone-400 text-sm">Topics</div>
              <div className="text-3xl font-serif">{stats.topicCount}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6">
              <div className="text-stone-400 text-sm">Posts</div>
              <div className="text-3xl font-serif">{stats.postCount}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6">
              <div className="text-stone-400 text-sm">Comments</div>
              <div className="text-3xl font-serif">{stats.commentCount}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6">
              <div className="text-stone-400 text-sm">Users</div>
              <div className="text-3xl font-serif">{stats.userCount}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6">
              <div className="text-stone-400 text-sm">Active (7d)</div>
              <div className="text-3xl font-serif">{stats.activeUsers7d}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6">
              <div className="text-stone-400 text-sm">Total Likes</div>
              <div className="text-3xl font-serif">{stats.totalLikes}</div>
            </div>
          </div>
        )}
        {isAdmin && stats && stats.cadence7d?.length ? (
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6">
            <h2 className="text-xl font-serif mb-4">Posting Cadence (7d)</h2>
            <div className="grid grid-cols-7 gap-3">
              {stats.cadence7d.map((d) => (
                <div key={d.date} className="text-center">
                  <div className="text-stone-400 text-xs">{d.date.slice(5)}</div>
                  <div className="mt-2 h-20 bg-stone-800 rounded-lg border border-stone-700 flex items-end justify-center">
                    <div className="w-8 bg-stone-400 rounded-t" style={{ height: `${Math.min(100, d.count * 20)}%` }}></div>
                  </div>
                  <div className="text-stone-300 text-sm mt-2">{d.count}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
