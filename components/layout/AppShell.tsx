'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import { useIsMobile } from '@/lib/hooks';
import Sidebar from './Sidebar';
import Header from './Header';
import BottomNav from './BottomNav';

export default function AppShell({ children, title }: { children: React.ReactNode; title: string }) {
  const { currentUser, loading } = useApp();
  const router = useRouter();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!loading && !currentUser) router.push('/login');
  }, [currentUser, loading, router]);

  if (loading || !currentUser) return null;

  if (isMobile) {
    return (
      <div style={{ background: '#F4F4F4', minHeight: '100vh', paddingBottom: 64 }}>
        {/* 모바일 헤더 */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: '#FFFFFF', borderBottom: '1px solid #EBEBEB',
          padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              background: 'linear-gradient(135deg, #FF6200, #CC4E00)',
              width: 24, height: 24, borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: '#fff', fontWeight: 900, fontSize: 11 }}>A</span>
            </div>
            <h1 style={{ color: '#111111', fontSize: 16, fontWeight: 700 }}>{title}</h1>
          </div>
        </header>
        <div style={{ padding: '16px' }}>
          {children}
        </div>
        <BottomNav />
      </div>
    );
  }

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
