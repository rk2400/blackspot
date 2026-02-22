'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, logout as apiLogout } from '@/lib/api-client';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  isAdmin?: boolean;
  interests?: string[];
  address?: {
    full?: string;
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  } | null;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check user session on mount and when needed
  const checkUser = async (showLoading = false) => {
    if (showLoading) {
      setLoading(true);
    }
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  const refreshUser = async () => {
    setLoading(true);
    await checkUser(false);
  };

  const logout = async () => {
    try {
      await apiLogout();
      setUser(null);
      toast.success('Logged out successfully');
      router.push('/');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to logout');
    }
  };

  return (
    <UserContext.Provider value={{ user, loading, logout, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
