'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/context';
import { getRoleLabel } from '@/lib/store';
import {
  LayoutDashboard, FolderKanban, CheckSquare, Calendar,
  Menu, Files, Factory, Truck, Settings, LogOut, X
} from 'lucide-react';

const mainNav = [
  { href: '/dashboard', label: '대시보드', icon: LayoutDashboard },
  { href: '/projects', label: '프로젝트', icon: FolderKanban },
  { href: '/tasks', label: '작업', icon: CheckSquare },
  { href: '/calendar', label: '캘린더', icon: Calendar },
];

const moreNav = [
  { href: '/files', label: '파일/레퍼런스', icon: Files },
  { href: '/production', label: '생산관리', icon: Factory },
  { href: '/delivery', label: '납품관리', icon: Truck },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { currentUser, logout } = useApp();
  const [showMore, setShowMore] = useState(false);

  return (
    <>
      {/* 더보기 드로어 */}
      {showMore && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200 }} onClick={() => setShowMore(false)}>
          <div style={{
            position: 'absolute', bottom: 64, left: 0, right: 0,
            background: '#FFFFFF', borderRadius: '20px 20px 0 0',
            padding: '20px 16px 8px', boxShadow: '0 -4px 24px rgba(0,0,0,0.1)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <p style={{ color: '#AAAAAA', fontSize: 11, fontWeight: 600 }}>더보기</p>
              <button onClick={() => setShowMore(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#CCCCCC' }}>
                <X size={18} />
              </button>
            </div>

            {moreNav.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setShowMore(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '13px 12px', borderRadius: 10, marginBottom: 4,
                  background: pathname.startsWith(href) ? 'rgba(255,98,0,0.08)' : '#F7F7F7',
                  color: pathname.startsWith(href) ? '#FF6200' : '#555555',
                  fontSize: 14, fontWeight: 500, textDecoration: 'none',
                }}>
                <Icon size={18} />
                {label}
              </Link>
            ))}

            {currentUser?.role === 'admin' && (
              <Link href="/admin" onClick={() => setShowMore(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '13px 12px', borderRadius: 10, marginBottom: 4,
                  background: pathname.startsWith('/admin') ? 'rgba(255,98,0,0.08)' : '#F7F7F7',
                  color: pathname.startsWith('/admin') ? '#FF6200' : '#555555',
                  fontSize: 14, fontWeight: 500, textDecoration: 'none',
                }}>
                <Settings size={18} />
                관리자
              </Link>
            )}

            <div style={{ borderTop: '1px solid #F0F0F0', marginTop: 8, paddingTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 12px' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FF6200, #CC4E00)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, color: '#fff', fontWeight: 700, flexShrink: 0,
                }}>
                  {currentUser?.name[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: '#111111', fontSize: 13, fontWeight: 600 }}>{currentUser?.name}</p>
                  <p style={{ color: '#AAAAAA', fontSize: 11 }}>{getRoleLabel(currentUser?.role || '')}</p>
                </div>
                <button onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#CCCCCC' }}>
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 하단 네비게이션 */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        background: '#FFFFFF', borderTop: '1px solid #EBEBEB',
        display: 'flex', height: 64,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {mainNav.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link key={href} href={href}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 3,
                color: active ? '#FF6200' : '#AAAAAA',
                textDecoration: 'none', fontSize: 10, fontWeight: active ? 600 : 400,
              }}>
              <Icon size={22} />
              {label}
            </Link>
          );
        })}
        <button
          onClick={() => setShowMore(v => !v)}
          style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 3,
            color: showMore ? '#FF6200' : '#AAAAAA',
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 10, fontWeight: 400,
          }}>
          <Menu size={22} />
          더보기
        </button>
      </nav>
    </>
  );
}
