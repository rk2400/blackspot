'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminHeader from '@/components/AdminHeader';

export default function AdminDashboard() {
  const router = useRouter();

  useEffect(() => {
    // If needed, add admin auth checks here; AdminHeader already guards non-admin.
  }, [router]);

  return (
    <div className="min-h-screen bg-stone-900 text-white">
      <AdminHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/users" className="card p-6 hover:shadow-lg transition-shadow hover:bg-stone-800">
              <div className="text-3xl mb-3">👥</div>
              <h3 className="text-lg font-semibold mb-2">Users</h3>
              <p className="text-sm text-stone-300">Manage user accounts</p>
            </Link>
            <Link href="/admin/emails" className="card p-6 hover:shadow-lg transition-shadow hover:bg-stone-800">
              <div className="text-3xl mb-3">✉️</div>
              <h3 className="text-lg font-semibold mb-2">Email Templates</h3>
              <p className="text-sm text-stone-300">Configure communication content</p>
            </Link>
            <Link href="/" className="card p-6 hover:shadow-lg transition-shadow hover:bg-stone-800">
              <div className="text-3xl mb-3">🪐</div>
              <h3 className="text-lg font-semibold mb-2">Site</h3>
              <p className="text-sm text-stone-300">View the public site</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
