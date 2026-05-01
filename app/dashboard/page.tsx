'use client';

import AppShell from '@/components/layout/AppShell';
import { useApp } from '@/lib/context';
import { useIsMobile } from '@/lib/hooks';
import { getUser, getStatusColor, getStatusLabel, getRoleLabel } from '@/lib/store';
import { format, isPast, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import Link from 'next/link';

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div style={{
      background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: 14,
      padding: '20px 24px', flex: 1,
      boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
    }}>
      <p style={{ color: '#AAAAAA', fontSize: 11, marginBottom: 8 }}>{label}</p>
      <p style={{ color: color || '#111111', fontSize: 28, fontWeight: 800 }}>{value}</p>
      {sub && <p style={{ color: '#CCCCCC', fontSize: 11, marginTop: 4 }}>{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const { currentUser, projects, tasks, events } = useApp();
  const isMobile = useIsMobile();

  const myTasks = tasks.filter(t => t.assigneeId === currentUser?.id);
  const overdueTasks = myTasks.filter(t => t.dueDate && isPast(parseISO(t.dueDate)) && t.status !== 'done');
  const inProgressTasks = myTasks.filter(t => t.status === 'inprogress');
  const doneTasks = myTasks.filter(t => t.status === 'done');
  const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'planning');

  const upcomingEvents = events
    .filter(e => !isPast(parseISO(e.date)))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);

  const recentTasks = tasks
    .filter(t => currentUser?.role === 'admin' || t.assigneeId === currentUser?.id)
    .slice(0, 5);

  const eventTypeColor: Record<string, string> = {
    meeting: '#6366F1', deadline: '#EF4444',
    delivery: '#FF6200', production: '#F59E0B', other: '#AAAAAA',
  };

  return (
    <AppShell title="대시보드">
      {/* Welcome */}
      <div style={{
        background: 'linear-gradient(135deg, #FF6200 0%, #CC4E00 100%)',
        borderRadius: 18, padding: '24px 28px',
        marginBottom: 24, position: 'relative', overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(255,98,0,0.2)',
      }}>
        <div style={{
          position: 'absolute', right: -30, top: -30, width: 180, height: 180,
          borderRadius: '50%', background: 'rgba(255,255,255,0.06)',
        }} />
        <div style={{
          position: 'absolute', right: 40, bottom: -60, width: 200, height: 200,
          borderRadius: '50%', background: 'rgba(255,255,255,0.04)',
        }} />
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 600, letterSpacing: 2, marginBottom: 6 }}>
          {getRoleLabel(currentUser?.role || '').toUpperCase()}
        </p>
        <h2 style={{ color: '#FFFFFF', fontSize: 22, fontWeight: 800 }}>
          안녕하세요, {currentUser?.name}님 👋
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 6 }}>
          오늘 {format(new Date(), 'M월 d일 EEEE', { locale: ko })} · 진행 중인 프로젝트 {activeProjects.length}개
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        <StatCard label="내 전체 작업" value={myTasks.length} sub="할당된 작업" />
        <StatCard label="진행 중" value={inProgressTasks.length} sub="현재 작업 중" color="#FF6200" />
        <StatCard label="완료" value={doneTasks.length} sub="완료된 작업" color="#10B981" />
        <StatCard label="기한 초과" value={overdueTasks.length} sub="즉시 처리 필요" color={overdueTasks.length > 0 ? '#EF4444' : '#CCCCCC'} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16, marginBottom: 20 }}>
        {/* Active Projects */}
        <div style={{ background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: 14, padding: 20, boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ color: '#111111', fontSize: 14, fontWeight: 600 }}>진행 중 / 기획 중 프로젝트</h3>
            <Link href="/projects" style={{ color: '#FF6200', fontSize: 11, textDecoration: 'none' }}>전체 보기</Link>
          </div>
          {activeProjects.map(p => (
            <Link key={p.id} href={`/projects/${p.id}`} style={{ textDecoration: 'none' }}>
              <div style={{
                padding: '12px 14px', background: '#F8F8F8', borderRadius: 10,
                marginBottom: 8, cursor: 'pointer', border: '1px solid #F0F0F0',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <p style={{ color: '#111111', fontSize: 13, fontWeight: 500 }}>{p.name}</p>
                    <p style={{ color: '#AAAAAA', fontSize: 11, marginTop: 2 }}>{p.client}</p>
                  </div>
                  <span style={{
                    background: 'rgba(255,98,0,0.1)', color: '#FF6200',
                    fontSize: 10, padding: '3px 8px', borderRadius: 6, fontWeight: 700,
                    height: 'fit-content',
                  }}>
                    {p.progress}%
                  </span>
                </div>
                <div style={{ background: '#E8E8E8', borderRadius: 4, height: 3 }}>
                  <div style={{
                    background: 'linear-gradient(90deg, #FF6200, #FF7A1A)',
                    width: `${p.progress}%`, height: '100%', borderRadius: 4,
                  }} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Upcoming Events */}
        <div style={{ background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: 14, padding: 20, boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ color: '#111111', fontSize: 14, fontWeight: 600 }}>다가오는 일정</h3>
            <Link href="/calendar" style={{ color: '#FF6200', fontSize: 11, textDecoration: 'none' }}>캘린더 보기</Link>
          </div>
          {upcomingEvents.length === 0 ? (
            <p style={{ color: '#CCCCCC', fontSize: 13 }}>예정된 일정 없음</p>
          ) : (
            upcomingEvents.map(e => (
              <div key={e.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 0', borderBottom: '1px solid #F5F5F5',
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: `${eventTypeColor[e.type]}10`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0,
                  border: `1px solid ${eventTypeColor[e.type]}20`,
                }}>
                  <p style={{ color: eventTypeColor[e.type], fontSize: 9, fontWeight: 700 }}>
                    {format(parseISO(e.date), 'MMM', { locale: ko }).toUpperCase()}
                  </p>
                  <p style={{ color: eventTypeColor[e.type], fontSize: 14, fontWeight: 800 }}>
                    {format(parseISO(e.date), 'd')}
                  </p>
                </div>
                <div>
                  <p style={{ color: '#111111', fontSize: 12, fontWeight: 500 }}>{e.title}</p>
                  <p style={{ color: '#AAAAAA', fontSize: 10, marginTop: 2 }}>
                    {format(parseISO(e.date), 'M월 d일 (EEEE)', { locale: ko })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Tasks */}
      <div style={{ background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: 14, padding: 20, boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ color: '#111111', fontSize: 14, fontWeight: 600 }}>최근 작업</h3>
          <Link href="/tasks" style={{ color: '#FF6200', fontSize: 11, textDecoration: 'none' }}>전체 보기</Link>
        </div>
        {isMobile ? (
          recentTasks.map(t => {
            const assignee = getUser(t.assigneeId);
            const overdue = t.dueDate && isPast(parseISO(t.dueDate)) && t.status !== 'done';
            const statusColor = getStatusColor(t.status);
            return (
              <div key={t.id} style={{ padding: '12px 0', borderBottom: '1px solid #F5F5F5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ color: '#111111', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{t.title}</p>
                  <p style={{ color: '#AAAAAA', fontSize: 11 }}>{assignee?.name} · {t.dueDate ? format(parseISO(t.dueDate), 'M/d') : '-'}{overdue ? ' ⚠️' : ''}</p>
                </div>
                <span style={{ background: `${statusColor}12`, color: statusColor, fontSize: 10, padding: '3px 8px', borderRadius: 4, fontWeight: 600, flexShrink: 0 }}>
                  {getStatusLabel(t.status)}
                </span>
              </div>
            );
          })
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 0 }}>
            {['작업명', '담당자', '상태', '마감일'].map(h => (
              <p key={h} style={{ color: '#CCCCCC', fontSize: 11, padding: '0 0 10px', borderBottom: '1px solid #F5F5F5' }}>{h}</p>
            ))}
            {recentTasks.map(t => {
              const assignee = getUser(t.assigneeId);
              const overdue = t.dueDate && isPast(parseISO(t.dueDate)) && t.status !== 'done';
              const statusColor = getStatusColor(t.status);
              return (
                <>
                  <p key={`n${t.id}`} style={{ color: '#111111', fontSize: 12, padding: '12px 0', borderBottom: '1px solid #F9F9F9' }}>{t.title}</p>
                  <p key={`a${t.id}`} style={{ color: '#888888', fontSize: 12, padding: '12px 0', borderBottom: '1px solid #F9F9F9' }}>{assignee?.name}</p>
                  <div key={`s${t.id}`} style={{ padding: '10px 0', borderBottom: '1px solid #F9F9F9' }}>
                    <span style={{ background: `${statusColor}12`, color: statusColor, fontSize: 10, padding: '3px 8px', borderRadius: 4, fontWeight: 600 }}>
                      {getStatusLabel(t.status)}
                    </span>
                  </div>
                  <p key={`d${t.id}`} style={{ color: overdue ? '#EF4444' : '#AAAAAA', fontSize: 12, padding: '12px 0', borderBottom: '1px solid #F9F9F9' }}>
                    {t.dueDate ? format(parseISO(t.dueDate), 'M/d') : '-'}{overdue && ' ⚠️'}
                  </p>
                </>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
