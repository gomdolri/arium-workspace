'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useApp } from '@/lib/context';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function Header({ title }: { title: string }) {
  const { currentUser, notifications, markNotificationRead, unreadCount } = useApp();
  const [showNotif, setShowNotif] = useState(false);

  const myNotifs = notifications.filter(n => n.userId === currentUser?.id);

  return (
    <header style={{ borderBottom: '1px solid #EBEBEB', background: '#FFFFFF' }}
      className="sticky top-0 z-10 px-8 py-4 flex items-center justify-between">
      <h1 style={{ color: '#111111', fontSize: 18, fontWeight: 700 }}>{title}</h1>

      <div className="flex items-center gap-4">
        <p style={{ color: '#BBBBBB', fontSize: 12 }}>
          {format(new Date(), 'yyyy년 M월 d일 EEEE', { locale: ko })}
        </p>

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotif(v => !v)}
            style={{
              background: '#F5F5F5', border: '1px solid #EBEBEB',
              borderRadius: 8, padding: '6px 10px', cursor: 'pointer',
              color: unreadCount > 0 ? '#FF6200' : '#AAAAAA', display: 'flex',
            }}>
            <Bell size={16} />
          </button>
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: -4, right: -4,
              background: '#FF6200', color: '#fff', borderRadius: '50%',
              width: 16, height: 16, fontSize: 9, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {unreadCount}
            </span>
          )}

          {showNotif && (
            <div style={{
              position: 'absolute', right: 0, top: 44,
              background: '#FFFFFF', border: '1px solid #EBEBEB',
              borderRadius: 12, padding: 8, minWidth: 280, zIndex: 50,
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            }}>
              <p style={{ color: '#AAAAAA', fontSize: 11, padding: '4px 8px 8px' }}>알림</p>
              {myNotifs.length === 0 ? (
                <p style={{ color: '#CCCCCC', fontSize: 12, padding: '8px' }}>새 알림 없음</p>
              ) : (
                myNotifs.slice(0, 5).map(n => (
                  <div key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    style={{
                      padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
                      background: n.read ? 'transparent' : 'rgba(255,98,0,0.04)',
                      marginBottom: 2,
                    }}>
                    <p style={{ color: n.read ? '#AAAAAA' : '#111111', fontSize: 12 }}>{n.message}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
