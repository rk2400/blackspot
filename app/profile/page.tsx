'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// Header and Footer are provided by `app/layout.tsx`
import { useUser } from '@/lib/contexts/UserContext';
import toast from 'react-hot-toast';
import { updateUserInterests } from '@/lib/api-client';

export default function ProfilePage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [editingInterests, setEditingInterests] = useState(false);
  const ALLOWED = useMemo(() => [
    'Meditation',
    'Breathwork',
    'Yoga',
    'Mindfulness',
    'Affirmations',
    'Journaling',
    'Spirituality',
    'Nature',
    'Art',
    'Music',
    'Gratitude',
    'Community',
  ], []);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    if (user?.interests && Array.isArray(user.interests)) {
      const normalized = new Set<string>();
      for (const i of user.interests) {
        const match = ALLOWED.find((a) => a.toLowerCase() === String(i).toLowerCase());
        if (match) normalized.add(match);
      }
      setSelectedInterests(Array.from(normalized));
    } else {
      setSelectedInterests([]);
    }
  }, [user, ALLOWED]);

  if (userLoading) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-300"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-stone-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <h1 className="text-4xl font-serif text-white mb-8">My Profile</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-stone-900 rounded-xl shadow-sm border border-stone-800 p-6">
              <h2 className="text-xl font-serif text-white mb-6 border-b border-stone-800 pb-4">Account Information</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-1">Name</p>
                  <p className="font-medium text-stone-200 text-lg">{user.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-1">Email</p>
                  <p className="font-medium text-stone-200 text-lg">{user.email}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-1">Phone</p>
                  <p className="font-medium text-stone-200 text-lg">{user.phone || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-stone-900 rounded-xl shadow-sm border border-stone-800 p-6">
              <h2 className="text-xl font-serif text-white mb-6 border-b border-stone-800 pb-4">Spiritual Journey</h2>
              <p className="text-stone-300 leading-relaxed">
                Welcome to The BlackSpot Project. Your profile will host your saved practices and tools
                focused on mental wellness and spirituality as we build them out.
              </p>
            </div>

            <div className="bg-stone-900 rounded-xl shadow-sm border border-stone-800 p-6 mt-6">
              <div className="flex items-center justify-between mb-6 border-b border-stone-800 pb-4">
                <h2 className="text-xl font-serif text-white">Interests</h2>
                <button
                  className="btn btn-secondary"
                  onClick={() => setEditingInterests((e) => !e)}
                >
                  {editingInterests ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {!editingInterests ? (
                <div>
                  {selectedInterests.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedInterests.map((i) => (
                        <span key={i} className="px-3 py-1 rounded-full bg-stone-800 text-stone-200 border border-stone-700 text-sm">
                          {i}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-stone-300">No interests added yet.</p>
                  )}
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                    {ALLOWED.map((opt) => {
                      const active = selectedInterests.includes(opt);
                      return (
                        <button
                          key={opt}
                          className={`px-3 py-2 rounded-lg border transition-colors ${active ? 'bg-stone-800 border-stone-600 text-white' : 'bg-stone-900 border-stone-700 text-stone-300 hover:bg-stone-800'}`}
                          onClick={() => {
                            setSelectedInterests((prev) =>
                              prev.includes(opt) ? prev.filter((v) => v !== opt) : [...prev, opt]
                            );
                          }}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    className="btn btn-primary"
                    disabled={loading}
                    onClick={async () => {
                      try {
                        setLoading(true);
                        const saved = await updateUserInterests(selectedInterests);
                        setSelectedInterests(saved);
                        setEditingInterests(false);
                        toast.success('Interests updated');
                      } catch (err: any) {
                        toast.error(err.message || 'Failed to save interests');
                      } finally {
                        setLoading(false);
                      }
                    }}
                  >
                    {loading ? 'Saving...' : 'Save Interests'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
