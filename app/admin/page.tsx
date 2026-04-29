'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import { useApp } from '@/lib/context';
import { getRoleLabel, getStatusColor, getStatusLabel } from '@/lib/store';
import { Users, FolderKanban, CheckSquare, Truck } from 'lucide-react';

export default function AdminPage() {
  const { currentUser, users, projects, tasks, deliveries } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') router.push('/dashboard');
  }, [currentUser, router]);

  if (!currentUser || currentUser.role !== 'admin') return null;

  const tasksByUser = users.map(u => ({
    user: u,
    total: tasks.filter(t => t.assigneeId === u.id).length,
    inProgress: tasks.filter(t => t.assigneeId === u.id && t.status === 'inprogress').length,
    done: tasks.filter(t => t.assigneeId === u.id && t.status === 'done').length,
  }));

  const stats = [
    { label: '총 팀원', value: users.length, icon: Users, color: '#6366F1' },
    { label: '진행 중 프로젝트', value: projects.filter(p => p.status === 'active').length, icon: FolderKanban, color: '#FF6200' },
    { label: '전체 작업', value: tasks.length, icon: CheckSquare, color: '#F59E0B' },
    { label: '납품 현황', value: deliveries.length, icon: Truck, color: '#10B981' },
  ];

  return (
    <AppShell title="관리자 패널">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: 14, padding: '20px 24px', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ color: '#AAAAAA', fontSize: 11, marginBottom: 8 }}>{s.label}</p>
                <p style={{ color: s.color, fontSize: 28, fontWeight: 800 }}>{s.value}</p>
              </div>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `${s.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={18} color={s.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: 14, padding: 20, boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
          <h3 style={{ color: '#111111', fontSize: 14, fontWeight: 600, marginBottom: 16 }}>팀원별 작업 현황</h3>
          {tasksByUser.map(({ user, total, inProgress, done }) => (
            <div key={user.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #FF6200, #CC4E00)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#fff', fontWeight: 700, flexShrink: 0 }}>
                {user.name[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <div>
                    <span style={{ color: '#111111', fontSize: 12, fontWeight: 500 }}>{user.name}</span>
                    <span style={{ color: '#AAAAAA', fontSize: 10, marginLeft: 6 }}>{getRoleLabel(user.role)}</span>
                  </div>
                  <span style={{ color: '#AAAAAA', fontSize: 10 }}>{done}/{total} 완료</span>
                </div>
                <div style={{ background: '#F0F0F0', borderRadius: 4, height: 4 }}>
                  <div style={{ background: 'linear-gradient(90deg, #FF6200, #FF7A1A)', width: `${total > 0 ? (done / total) * 100 : 0}%`, height: '100%', borderRadius: 4 }} />
                </div>
              </div>
              <span style={{ background: 'rgba(255,98,0,0.08)', color: '#FF6200', fontSize: 10, padding: '2px 8px', borderRadius: 4 }}>{inProgress} 진행</span>
            </div>
          ))}
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: 14, padding: 20, boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
          <h3 style={{ color: '#111111', fontSize: 14, fontWeight: 600, marginBottom: 16 }}>프로젝트 현황</h3>
          {projects.map(p => {
            const statusColor = getStatusColor(p.status);
            const pTasks = tasks.filter(t => t.projectId === p.id);
            const doneTasks = pTasks.filter(t => t.status === 'done').length;
            return (
              <div key={p.id} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div>
                    <span style={{ color: '#111111', fontSize: 12, fontWeight: 500 }}>{p.name}</span>
                    <span style={{ background: `${statusColor}12`, color: statusColor, fontSize: 9, padding: '2px 6px', borderRadius: 3, marginLeft: 8, fontWeight: 600 }}>{getStatusLabel(p.status)}</span>
                  </div>
                  <span style={{ color: '#FF6200', fontSize: 11, fontWeight: 700 }}>{p.progress}%</span>
                </div>
                <div style={{ background: '#F0F0F0', borderRadius: 4, height: 4 }}>
                  <div style={{ background: 'linear-gradient(90deg, #FF6200, #FF7A1A)', width: `${p.progress}%`, height: '100%', borderRadius: 4 }} />
                </div>
                <p style={{ color: '#AAAAAA', fontSize: 10, marginTop: 4 }}>작업 {doneTasks}/{pTasks.length}개 완료 · {p.client}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: 14, padding: 20, boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
        <h3 style={{ color: '#111111', fontSize: 14, fontWeight: 600, marginBottom: 14 }}>전체 작업 목록</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', borderBottom: '1px solid #F5F5F5', paddingBottom: 8, marginBottom: 4 }}>
          {['작업명', '프로젝트', '담당자', '상태', '진행률'].map(h => (
            <p key={h} style={{ color: '#CCCCCC', fontSize: 11 }}>{h}</p>
          ))}
        </div>
        {tasks.map(t => {
          const project = projects.find(p => p.id === t.projectId);
          const assignee = users.find(u => u.id === t.assigneeId);
          const statusColor = getStatusColor(t.status);
          return (
            <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '10px 0', borderBottom: '1px solid #F9F9F9', alignItems: 'center' }}>
              <p style={{ color: '#111111', fontSize: 12 }}>{t.title}</p>
              <p style={{ color: '#AAAAAA', fontSize: 11 }}>{project?.name}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'linear-gradient(135deg, #FF6200, #CC4E00)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#fff', fontWeight: 700 }}>{assignee?.name[0]}</div>
                <span style={{ color: '#888888', fontSize: 11 }}>{assignee?.name}</span>
              </div>
              <span style={{ background: `${statusColor}12`, color: statusColor, fontSize: 10, padding: '3px 8px', borderRadius: 4, fontWeight: 600, width: 'fit-content' }}>{getStatusLabel(t.status)}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, background: '#F0F0F0', borderRadius: 4, height: 3 }}>
                  <div style={{ background: '#FF6200', width: `${t.progress}%`, height: '100%', borderRadius: 4 }} />
                </div>
                <span style={{ color: '#AAAAAA', fontSize: 10, flexShrink: 0 }}>{t.progress}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
