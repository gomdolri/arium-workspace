'use client';

import { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useApp } from '@/lib/context';
import { getStatusColor, getStatusLabel } from '@/lib/store';
import { format, parseISO } from 'date-fns';
import { Plus, X } from 'lucide-react';
import Link from 'next/link';

export default function ProjectsPage() {
  const { projects, users, addProject } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', client: '', description: '', status: 'planning', startDate: '', endDate: '', members: [] as string[] });
  const [filter, setFilter] = useState('all');

  const handleAdd = () => {
    if (!form.name || !form.client) return;
    addProject({ ...form, progress: 0, status: form.status as any });
    setForm({ name: '', client: '', description: '', status: 'planning', startDate: '', endDate: '', members: [] });
    setShowAdd(false);
  };

  const filtered = projects.filter(p => filter === 'all' || p.status === filter);

  const inputStyle = { width: '100%', background: '#F7F7F7', border: '1px solid #EBEBEB', borderRadius: 8, padding: '9px 12px', color: '#111111', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const };

  return (
    <AppShell title="프로젝트">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['all', 'active', 'planning', 'completed', 'paused'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              style={{
                background: filter === s ? 'rgba(255,98,0,0.08)' : '#FFFFFF',
                border: `1px solid ${filter === s ? '#FF6200' : '#EBEBEB'}`,
                color: filter === s ? '#FF6200' : '#888888',
                fontSize: 12, padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
              }}>
              {s === 'all' ? '전체' : getStatusLabel(s)}
            </button>
          ))}
        </div>
        <button onClick={() => setShowAdd(true)}
          style={{ background: 'linear-gradient(135deg, #FF6200, #CC4E00)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, boxShadow: '0 2px 12px rgba(255,98,0,0.2)' }}>
          <Plus size={14} /> 프로젝트 추가
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {filtered.map(p => {
          const statusColor = getStatusColor(p.status);
          return (
            <Link key={p.id} href={`/projects/${p.id}`} style={{ textDecoration: 'none' }}>
              <div style={{ background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: 16, padding: 22, cursor: 'pointer', height: '100%', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                  <span style={{ background: `${statusColor}12`, color: statusColor, fontSize: 10, padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>
                    {getStatusLabel(p.status)}
                  </span>
                  <span style={{ color: '#CCCCCC', fontSize: 11 }}>{format(parseISO(p.startDate), 'yy.MM.dd')}</span>
                </div>
                <h3 style={{ color: '#111111', fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{p.name}</h3>
                <p style={{ color: '#FF6200', fontSize: 11, marginBottom: 8 }}>{p.client}</p>
                {p.description && <p style={{ color: '#AAAAAA', fontSize: 12, marginBottom: 16, lineHeight: 1.5 }}>{p.description}</p>}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ color: '#AAAAAA', fontSize: 10 }}>진행률</span>
                    <span style={{ color: '#FF6200', fontSize: 10, fontWeight: 700 }}>{p.progress}%</span>
                  </div>
                  <div style={{ background: '#F0F0F0', borderRadius: 4, height: 4 }}>
                    <div style={{ background: 'linear-gradient(90deg, #FF6200, #FF7A1A)', width: `${p.progress}%`, height: '100%', borderRadius: 4 }} />
                  </div>
                </div>
                <div style={{ display: 'flex' }}>
                  {p.members.slice(0, 4).map((mid, i) => {
                    const member = users.find(u => u.id === mid);
                    return (
                      <div key={mid} style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #FF6200, #CC4E00)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff', fontWeight: 700, border: '2px solid #FFFFFF', marginLeft: i > 0 ? -6 : 0 }}>
                        {member?.name[0]}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setShowAdd(false)}>
          <div style={{ background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: 18, padding: 28, width: '100%', maxWidth: 480, maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ color: '#111111', fontSize: 16, fontWeight: 700 }}>새 프로젝트</h2>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', color: '#CCCCCC', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            {[{ label: '프로젝트명', key: 'name', placeholder: '프로젝트 이름' }, { label: '클라이언트', key: 'client', placeholder: '클라이언트 / 브랜드명' }].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <label style={{ color: '#AAAAAA', fontSize: 11, display: 'block', marginBottom: 6 }}>{f.label}</label>
                <input value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} style={inputStyle} />
              </div>
            ))}
            <div style={{ marginBottom: 14 }}>
              <label style={{ color: '#AAAAAA', fontSize: 11, display: 'block', marginBottom: 6 }}>설명</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="프로젝트 설명" rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              {[{ label: '시작일', key: 'startDate' }, { label: '마감일', key: 'endDate' }].map(f => (
                <div key={f.key}>
                  <label style={{ color: '#AAAAAA', fontSize: 11, display: 'block', marginBottom: 6 }}>{f.label}</label>
                  <input type="date" value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} style={{ ...inputStyle, colorScheme: 'light' }} />
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ color: '#AAAAAA', fontSize: 11, display: 'block', marginBottom: 8 }}>팀원 선택</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {users.map(u => (
                  <button key={u.id}
                    onClick={() => setForm(p => ({ ...p, members: p.members.includes(u.id) ? p.members.filter(id => id !== u.id) : [...p.members, u.id] }))}
                    style={{ background: form.members.includes(u.id) ? 'rgba(255,98,0,0.08)' : '#F7F7F7', border: `1px solid ${form.members.includes(u.id) ? '#FF6200' : '#EBEBEB'}`, color: form.members.includes(u.id) ? '#FF6200' : '#888888', fontSize: 12, padding: '5px 12px', borderRadius: 6, cursor: 'pointer' }}>
                    {u.name}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={handleAdd} style={{ width: '100%', background: 'linear-gradient(135deg, #FF6200, #CC4E00)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, padding: '11px', cursor: 'pointer', fontWeight: 700, boxShadow: '0 4px 16px rgba(255,98,0,0.2)' }}>
              프로젝트 생성
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
