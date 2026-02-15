'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// Header and Footer are provided by `app/layout.tsx`
import { useUser } from '@/lib/contexts/UserContext';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

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
          </div>
        </div>
      </main>
    </div>
  );
}
