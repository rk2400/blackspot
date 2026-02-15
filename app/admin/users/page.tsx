'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminHeader from '@/components/AdminHeader';
import { getAdminUsers, updateAdminUserLock, updateAdminUserManifestLimit, getAdminManifestLimit, updateAdminManifestLimit } from '@/lib/api-client';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [limits, setLimits] = useState<Record<string, number>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [globalLimit, setGlobalLimit] = useState<number>(3);
  const [savingGlobal, setSavingGlobal] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [perUserLimit, setPerUserLimit] = useState<number>(3);
  const [savingPerUser, setSavingPerUser] = useState<boolean>(false);

  useEffect(() => {
    loadUsers();
    loadGlobal();
  }, []);

  async function loadUsers() {
    try {
      const data = await getAdminUsers();
      setUsers(data);
      const map: Record<string, number> = {};
      data.forEach((u: any) => {
        const id = u._id?.toString?.() ?? String(u._id);
        map[id] = typeof u.manifestMaxVideos === 'number' ? u.manifestMaxVideos : 3;
      });
      setLimits(map);
    } catch (error: any) {
      if (error.message.includes('Unauthorized') || error.message.includes('Admin')) {
        router.push('/admin/login');
      } else {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadGlobal() {
    try {
      const data = await getAdminManifestLimit();
      if (typeof data?.maxVideos === 'number') {
        setGlobalLimit(data.maxVideos);
      }
    } catch (error: any) {
      // Ignore if unauthorized or not available
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-900 text-white">
      <AdminHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8">All Users</h1>
        
        {users.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No users found.</p>
          </div>
        ) : (
          <div className="card p-6 overflow-x-auto">
            <div className="mb-6 flex items-center gap-3">
              <label className="text-sm text-stone-300">Global Manifest Limit</label>
              <input
                type="number"
                min={1}
                max={50}
                value={globalLimit}
                onChange={(e) => setGlobalLimit(Math.max(1, Math.min(50, Number(e.target.value))))}
                className="w-24 input"
              />
              <button
                className="btn btn-primary"
                disabled={savingGlobal}
                onClick={async () => {
                  try {
                    setSavingGlobal(true);
                    await updateAdminManifestLimit(globalLimit);
                    toast.success('Global limit updated');
                  } catch (err: any) {
                    toast.error(err.message || 'Failed to update global limit');
                  } finally {
                    setSavingGlobal(false);
                  }
                }}
              >
                {savingGlobal ? 'Saving…' : 'Save'}
              </button>
            </div>
            <div className="mb-6 flex items-center gap-3">
              <label className="text-sm text-stone-300">Per-User Manifest Limit</label>
              <select
                className="input w-64"
                value={selectedUserId}
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedUserId(id);
                  const current = limits[id] ?? 3;
                  setPerUserLimit(current);
                }}
              >
                <option value="">Select user…</option>
                {users.map((u) => {
                  const id = u._id?.toString?.() ?? String(u._id);
                  return (
                    <option key={id} value={id}>
                      {u.email} — {u.name || 'N/A'}
                    </option>
                  );
                })}
              </select>
              <input
                type="number"
                min={1}
                max={50}
                value={perUserLimit}
                onChange={(e) => setPerUserLimit(Math.max(1, Math.min(50, Number(e.target.value))))}
                className="w-24 input"
                disabled={!selectedUserId}
              />
              <button
                className="btn btn-primary"
                disabled={savingPerUser || !selectedUserId}
                onClick={async () => {
                  if (!selectedUserId) return;
                  try {
                    setSavingPerUser(true);
                    const updated = await updateAdminUserManifestLimit(selectedUserId, perUserLimit);
                    if (typeof updated?.manifestMaxVideos === 'number') {
                      setPerUserLimit(updated.manifestMaxVideos);
                      setLimits((prev) => ({ ...prev, [selectedUserId]: updated.manifestMaxVideos }));
                    }
                    await loadUsers();
                    toast.success('User limit updated');
                  } catch (err: any) {
                    toast.error(err.message || 'Failed to update user limit');
                  } finally {
                    setSavingPerUser(false);
                  }
                }}
              >
                {savingPerUser ? 'Saving…' : 'Save'}
              </button>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Name</th>
                  <th className="text-left p-4">Email</th>
                  <th className="text-left p-4">Phone</th>
                  <th className="text-left p-4">Registration Date</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Limit</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: any) => (
                  <tr key={user._id} className="border-b hover:bg-stone-800">
                    <td className="p-4 font-medium">{user.name || 'N/A'}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">{user.phone || 'N/A'}</td>
                    <td className="p-4 text-stone-300">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs ${user.locked ? 'bg-red-200 text-red-900' : 'bg-green-200 text-green-900'}`}>
                        {user.locked ? 'Locked' : 'Active'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="inline-block px-3 py-1 rounded-lg bg-stone-800 border border-stone-700 text-sm">
                        {(limits[user._id?.toString?.() ?? String(user._id)] ?? user.manifestMaxVideos ?? 3)}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        className={`btn ${user.locked ? 'btn-secondary' : 'btn-danger'}`}
                        onClick={async () => {
                          try {
                            await updateAdminUserLock(user._id, !user.locked);
                            toast.success(user.locked ? 'User unlocked' : 'User locked');
                            loadUsers();
                          } catch (err: any) {
                            toast.error(err.message || 'Failed to update user');
                          }
                        }}
                      >
                        {user.locked ? 'Unlock' : 'Lock'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
