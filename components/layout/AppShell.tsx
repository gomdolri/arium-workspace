'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppShell({ children, title }: { children: React.ReactNode; title: string }) {
  const { currentUser, loading } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !currentUser) router.push('/login');
  }, [currentUser, loading, router]);

  if (loading || !currentUser) return null;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F4F4F4' }}>
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} />
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
