'use client';

import { use } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useApp } from '@/lib/context';
import { getStatusColor, getStatusLabel } from '@/lib/store';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { projects, tasks, productions, deliveries, users, updateProject } = useApp();

  const project = projects.find(p => p.id === id);
  if (!project) return <AppShell title="프로젝트"><p style={{ color: '#AAAAAA' }}>프로젝트를 찾을 수 없습니다.</p></AppShell>;

  const projectTasks = tasks.filter(t => t.projectId === id);
  const projectProductions = productions.filter(p => p.projectId === id);
  const projectDeliveries = deliveries.filter(d => d.projectId === id);
  const statusColor = getStatusColor(project.status);

  return (
    <AppShell title={project.name}>
      <Link href="/projects" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#AAAAAA', fontSize: 12, textDecoration: 'none', marginBottom: 20 }}>
        <ArrowLeft size={14} /> 프로젝트 목록
      </Link>

      <div style={{ background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: 18, padding: 28, marginBottom: 20, boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ background: `${statusColor}12`, color: statusColor, fontSize: 10, padding: '3px 10px', borderRadius: 20, fontWeight: 600, display: 'inline-block', marginBottom: 10 }}>
              {getStatusLabel(project.status)}
            </span>
            <h2 style={{ color: '#111111', fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{project.name}</h2>
            <p style={{ color: '#FF6200', fontSize: 13, marginBottom: 8 }}>{project.client}</p>
            {project.description && <p style={{ color: '#888888', fontSize: 13, lineHeight: 1.6 }}>{project.description}</p>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: '#AAAAAA', fontSize: 11, marginBottom: 4 }}>기간</p>
            <p style={{ color: '#888888', fontSize: 12 }}>
              {format(parseISO(project.startDate), 'yy.MM.dd')}
              {project.endDate && ` ~ ${format(parseISO(project.endDate), 'yy.MM.dd')}`}
            </p>
          </div>
        </div>
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: '#AAAAAA', fontSize: 11 }}>전체 진행률</span>
            <span style={{ color: '#FF6200', fontSize: 13, fontWeight: 700 }}>{project.progress}%</span>
          </div>
          <input type="range" min={0} max={100} value={project.progress}
            onChange={e => updateProject(project.id, { progress: Number(e.target.value) })}
            style={{ width: '100%', accentColor: '#FF6200' }} />
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {project.members.map(mid => {
            const member = users.find(u => u.id === mid);
            if (!member) return null;
            return (
              <div key={mid} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F7F7F7', borderRadius: 20, padding: '4px 12px 4px 4px', border: '1px solid #EBEBEB' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, #FF6200, #CC4E00)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff', fontWeight: 700 }}>{member.name[0]}</div>
                <span style={{ color: '#888888', fontSize: 11 }}>{member.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: 14, padding: 20, boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ color: '#111111', fontSize: 14, fontWeight: 600 }}>작업 ({projectTasks.length})</h3>
            <Link href="/tasks" style={{ color: '#FF6200', fontSize: 11, textDecoration: 'none' }}>작업 보드 →</Link>
          </div>
          {projectTasks.length === 0 ? <p style={{ color: '#CCCCCC', fontSize: 12 }}>작업 없음</p> : (
            projectTasks.map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #F5F5F5' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: getStatusColor(t.status), flexShrink: 0, display: 'inline-block' }} />
                <span style={{ color: '#333333', fontSize: 12, flex: 1 }}>{t.title}</span>
                <span style={{ color: '#CCCCCC', fontSize: 10 }}>{t.progress}%</span>
              </div>
            ))
          )}
        </div>
        <div style={{ background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: 14, padding: 20, boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ color: '#111111', fontSize: 14, fontWeight: 600 }}>생산 ({projectProductions.length})</h3>
            <Link href="/production" style={{ color: '#FF6200', fontSize: 11, textDecoration: 'none' }}>생산 관리 →</Link>
          </div>
          {projectProductions.map(pr => (
            <div key={pr.id} style={{ padding: '8px 0', borderBottom: '1px solid #F5F5F5' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#333333', fontSize: 12 }}>{pr.productName}</span>
                <span style={{ background: `${getStatusColor(pr.status)}12`, color: getStatusColor(pr.status), fontSize: 10, padding: '2px 6px', borderRadius: 4 }}>{getStatusLabel(pr.status)}</span>
              </div>
              <span style={{ color: '#AAAAAA', fontSize: 10 }}>{pr.vendor} · {pr.quantity}개</span>
            </div>
          ))}
          {projectProductions.length === 0 && <p style={{ color: '#CCCCCC', fontSize: 12 }}>생산 없음</p>}
        </div>
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: 14, padding: 20, boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ color: '#111111', fontSize: 14, fontWeight: 600 }}>납품 ({projectDeliveries.length})</h3>
          <Link href="/delivery" style={{ color: '#FF6200', fontSize: 11, textDecoration: 'none' }}>납품 관리 →</Link>
        </div>
        {projectDeliveries.map(d => {
          const checked = d.checklist.filter(c => c.checked).length;
          return (
            <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: '1px solid #F5F5F5' }}>
              <div style={{ flex: 1 }}>
                <p style={{ color: '#333333', fontSize: 12 }}>{d.items}</p>
                <p style={{ color: '#AAAAAA', fontSize: 10 }}>{d.recipient} · 마감: {format(parseISO(d.dueDate), 'MM/dd')}</p>
              </div>
              <span style={{ background: `${getStatusColor(d.status)}12`, color: getStatusColor(d.status), fontSize: 10, padding: '2px 8px', borderRadius: 4 }}>{getStatusLabel(d.status)}</span>
              <span style={{ color: '#AAAAAA', fontSize: 10 }}>{checked}/{d.checklist.length}</span>
            </div>
          );
        })}
        {projectDeliveries.length === 0 && <p style={{ color: '#CCCCCC', fontSize: 12 }}>납품 없음</p>}
      </div>
    </AppShell>
  );
}
