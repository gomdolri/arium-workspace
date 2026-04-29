'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/context';
import { getRoleLabel } from '@/lib/store';
import {
  LayoutDashboard, FolderKanban, CheckSquare, Calendar,
  Files, Factory, Truck, Settings, LogOut
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: '대시보드', icon: LayoutDashboard },
  { href: '/projects', label: '프로젝트', icon: FolderKanban },
  { href: '/tasks', label: '작업', icon: CheckSquare },
  { href: '/calendar', label: '캘린더', icon: Calendar },
  { href: '/files', label: '파일/레퍼런스', icon: Files },
  { href: '/production', label: '생산관리', icon: Factory },
  { href: '/delivery', label: '납품관리', icon: Truck },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { currentUser, logout } = useApp();

  return (
    <aside style={{ background: '#FFFFFF', borderRight: '1px solid #EBEBEB' }}
      className="w-60 flex-shrink-0 flex flex-col h-screen sticky top-0">

      {/* Logo */}
      <div className="px-6 py-6 border-b" style={{ borderColor: '#EBEBEB' }}>
        <div className="flex items-center gap-2">
          <div style={{ background: '#FF6200', width: 28, height: 28, borderRadius: 6 }}
            className="flex items-center justify-center">
            <span className="text-white font-black text-xs">A</span>
          </div>
          <span style={{ color: '#111111' }} className="font-bold tracking-wider text-sm">ARIUM</span>
        </div>
        <p style={{ color: '#BBBBBB', fontSize: 10 }} className="mt-1 ml-9">WORKSPACE</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link key={href} href={href}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 8, marginBottom: 2,
                background: active ? 'rgba(255,98,0,0.08)' : 'transparent',
                color: active ? '#FF6200' : '#888888',
                fontSize: 13, fontWeight: active ? 600 : 400,
                textDecoration: 'none',
                transition: 'all 0.15s',
              }}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}

        {currentUser?.role === 'admin' && (
          <Link href="/admin"
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 8, marginBottom: 2,
              background: pathname.startsWith('/admin') ? 'rgba(255,98,0,0.08)' : 'transparent',
              color: pathname.startsWith('/admin') ? '#FF6200' : '#888888',
              fontSize: 13, fontWeight: pathname.startsWith('/admin') ? 600 : 400,
              textDecoration: 'none',
            }}>
            <Settings size={16} />
            관리자
          </Link>
        )}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t" style={{ borderColor: '#EBEBEB' }}>
        <div style={{ background: '#F7F7F7', borderRadius: 10, padding: '10px 12px' }}
          className="flex items-center gap-3">
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'linear-gradient(135deg, #FF6200, #CC4E00)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 13, color: '#fff', flexShrink: 0,
          }}>
            {currentUser?.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p style={{ color: '#111111', fontSize: 12, fontWeight: 600 }} className="truncate">
              {currentUser?.name}
            </p>
            <p style={{ color: '#AAAAAA', fontSize: 10 }}>
              {getRoleLabel(currentUser?.role || '')}
            </p>
          </div>
          <button onClick={logout}
            style={{ color: '#CCCCCC', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
            title="로그아웃">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
