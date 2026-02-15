"use client";

import Link from 'next/link';
import { useUser } from '@/lib/contexts/UserContext';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Header() {
  const { user, loading, logout } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
  };

  const isHomePage = pathname === '/';

  return (
    <div>
      <div className="bg-stone-900/90 backdrop-blur-md sticky top-0 z-50 border-b border-stone-800 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-8">
              <button className="md:hidden p-2 rounded-full hover:bg-stone-800 transition-colors" onClick={() => setOpen(!open)} aria-label="menu">
                <svg className="w-6 h-6 text-stone-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <Link href="/" className="text-3xl font-serif font-bold text-white tracking-tight hover:opacity-80 transition-opacity">
                The BlackSpot Project
              </Link>

              <nav className={`hidden md:flex items-center gap-8 ${open ? 'block' : ''}`}>
                {[
                  { name: 'Manifest', href: '/manifest' },
                  { name: 'Afirmations', href: '/afirmations' },
                  { name: 'Journal', href: '/journal' },
                  { name: 'About', href: '/about' },
                  { name: 'Contact', href: '/contact' },
                  { name: 'Help', href: '/help' },
                ].map((link) => (
                  <Link 
                    key={link.name}
                    href={link.href} 
                    className="text-sm font-medium uppercase tracking-wider text-stone-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-6">
              {loading ? (
                <div className="w-20 h-6 bg-stone-800 animate-pulse rounded-full"></div>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    {user ? (
                      <>
                        <div className="relative group">
                          <Link href="/profile" className="flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-primary-600 transition-colors">
                             <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center text-stone-300 group-hover:bg-stone-700 group-hover:text-white transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                             </div>
                          </Link>
                        </div>

                        {user.isAdmin && (
                          <Link
                            href="/admin/dashboard"
                            className="text-xs font-bold uppercase tracking-wider text-stone-300 hover:text-white border border-stone-700 px-3 py-1 rounded-full hover:bg-stone-800 transition-all"
                          >
                            Admin
                          </Link>
                        )}
                        
                        <button
                           onClick={handleLogout}
                           className="hidden md:inline text-sm font-medium text-stone-300 hover:text-red-400 transition-colors"
                        >
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="hidden md:flex items-center gap-3">
                          <Link href="/login" className="text-sm font-medium text-stone-300 hover:text-white transition-colors">
                            Log In
                          </Link>
                          <Link href="/signup" className="btn btn-primary text-sm px-5 py-2">
                            Sign Up
                          </Link>
                        </div>
                        <button
                          className="md:hidden w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center text-stone-300 hover:bg-stone-700 hover:text-white transition-colors"
                          onClick={() => setAccountOpen(!accountOpen)}
                          aria-label="Account"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

        {(open || accountOpen) && (
          <div className="md:hidden border-t border-stone-800 bg-stone-900 py-4 animate-fade-in">
            <nav className="flex flex-col gap-1 px-4">
              <Link href="/manifest" onClick={() => setOpen(false)} className="block px-4 py-3 rounded-lg hover:bg-stone-800 text-stone-300 font-medium">Manifest</Link>
              <Link href="/afirmations" onClick={() => setOpen(false)} className="block px-4 py-3 rounded-lg hover:bg-stone-800 text-stone-300 font-medium">Afirmations</Link>
              <Link href="/journal" onClick={() => setOpen(false)} className="block px-4 py-3 rounded-lg hover:bg-stone-800 text-stone-300 font-medium">Journal</Link>
              <Link href="/about" onClick={() => setOpen(false)} className="block px-4 py-3 rounded-lg hover:bg-stone-800 text-stone-300 font-medium">About</Link>
              <Link href="/contact" onClick={() => setOpen(false)} className="block px-4 py-3 rounded-lg hover:bg-stone-800 text-stone-300 font-medium">Contact</Link>
              <div className="border-t border-stone-800 my-2"></div>
              {user ? (
                <>
                  <Link href="/profile" onClick={() => setAccountOpen(false)} className="block px-4 py-3 rounded-lg hover:bg-stone-800 text-stone-300 font-medium">Account</Link>
                  <button
                    onClick={() => { setAccountOpen(false); handleLogout(); }}
                    className="block text-left w-full px-4 py-3 rounded-lg hover:bg-stone-800 text-red-400 font-medium"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setAccountOpen(false)} className="block px-4 py-3 rounded-lg hover:bg-stone-800 text-stone-300 font-medium">Login</Link>
                  <Link href="/signup" onClick={() => setAccountOpen(false)} className="block px-4 py-3 rounded-lg hover:bg-stone-800 text-stone-300 font-medium">Sign Up</Link>
                </>
              )}
            </nav>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
