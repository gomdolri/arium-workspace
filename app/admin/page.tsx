'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import { useApp } from '@/lib/context';
import { getRoleLabel, getStatusColor, getStatusLabel } from '@/lib/store';
import { Role } from '@/lib/types';
import { Users, FolderKanban, CheckSquare, Truck, Plus, X, Pencil, Trash2, KeyRound } from 'lucide-react';

const ROLES: { value: Role; label: string }[] = [
  { value: 'admin', label: '총괄책임자' },
  { value: 'designer', label: '디자이너' },
  { value: 'planner', label: '기획자' },
  { value: 'editor', label: '영상편집자' },
];

const inputStyle = {
  width: '100%', background: '#F7F7F7', border: '1px solid #EBEBEB',
  borderRadius: 8, padding: '9px 12px', color: '#111111',
  fontSize: 13, outline: 'none', boxSizing: 'border-box' as const,
};

export default function AdminPage() {
  const { currentUser, users, projects, tasks, deliveries, addUser, updateUser, changePassword, deleteUser } = useApp();
  const router = useRouter();
  const [tab, setTab] = useState<'overview' | 'members'>('overview');

  // 팀원 추가 모달
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', role: 'designer' as Role, email: '', password: '' });
  const [addLoading, setAddLoading] = useState(false);

  // 팀원 수정 모달
  const [editTarget, setEditTarget] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', role: 'designer' as Role, email: '' });

  // 비밀번호 변경 모달
  const [pwTarget, setPwTarget] = useState<string | null>(null);
  const [newPw, setNewPw] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  // 삭제 확인
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

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

  const handleAddUser = async () => {
    if (!addForm.name || !addForm.email || !addForm.password) return;
    setAddLoading(true);
    await addUser(addForm);
    setAddForm({ name: '', role: 'designer', email: '', password: '' });
    setShowAdd(false);
    setAddLoading(false);
  };

  const openEdit = (userId: string) => {
    const u = users.find(x => x.id === userId);
    if (!u) return;
    setEditForm({ name: u.name, role: u.role, email: u.email });
    setEditTarget(userId);
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    await updateUser(editTarget, editForm);
    setEditTarget(null);
  };

  const handlePwChange = async () => {
    if (!pwTarget || !newPw) return;
    setPwLoading(true);
    await changePassword(pwTarget, newPw);
    setPwTarget(null);
    setNewPw('');
    setPwLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteUser(deleteTarget);
    setDeleteTarget(null);
  };

  return (
    <AppShell title="관리자 패널">
      {/* 탭 */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#F0F0F0', padding: 4, borderRadius: 10, width: 'fit-content', border: '1px solid #EBEBEB' }}>
        {[{ key: 'overview', label: '전체 현황' }, { key: 'members', label: '팀원 관리' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            style={{ background: tab === t.key ? '#FF6200' : 'transparent', border: 'none', borderRadius: 7, color: tab === t.key ? '#fff' : '#888888', fontSize: 12, padding: '7px 18px', cursor: 'pointer', fontWeight: 600 }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
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
        </>
      )}

      {tab === 'members' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
            <button onClick={() => setShowAdd(true)}
              style={{ background: 'linear-gradient(135deg, #FF6200, #CC4E00)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, boxShadow: '0 2px 12px rgba(255,98,0,0.2)' }}>
              <Plus size={14} /> 팀원 추가
            </button>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 1fr', padding: '10px 20px', borderBottom: '1px solid #F5F5F5' }}>
              {['이름', '역할', '이메일', '관리'].map(h => (
                <p key={h} style={{ color: '#CCCCCC', fontSize: 11 }}>{h}</p>
              ))}
            </div>
            {users.map(u => (
              <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 1fr', padding: '14px 20px', borderBottom: '1px solid #F9F9F9', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #FF6200, #CC4E00)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#fff', fontWeight: 700, flexShrink: 0 }}>
                    {u.name[0]}
                  </div>
                  <span style={{ color: '#111111', fontSize: 13, fontWeight: 500 }}>{u.name}</span>
                </div>
                <span style={{ background: 'rgba(255,98,0,0.08)', color: '#FF6200', fontSize: 10, padding: '3px 8px', borderRadius: 4, fontWeight: 600, width: 'fit-content' }}>
                  {getRoleLabel(u.role)}
                </span>
                <p style={{ color: '#888888', fontSize: 12 }}>{u.email}</p>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => openEdit(u.id)}
                    style={{ background: '#F5F5F5', border: '1px solid #EBEBEB', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: '#888888' }} title="정보 수정">
                    <Pencil size={12} />
                  </button>
                  <button onClick={() => { setPwTarget(u.id); setNewPw(''); }}
                    style={{ background: '#F5F5F5', border: '1px solid #EBEBEB', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: '#888888' }} title="비밀번호 변경">
                    <KeyRound size={12} />
                  </button>
                  {u.id !== currentUser.id && (
                    <button onClick={() => setDeleteTarget(u.id)}
                      style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: '#EF4444' }} title="삭제">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 팀원 추가 모달 */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setShowAdd(false)}>
          <div style={{ background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: 18, padding: 28, width: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ color: '#111111', fontSize: 16, fontWeight: 700 }}>팀원 추가</h2>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', color: '#CCCCCC', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            {[{ label: '이름', key: 'name', placeholder: '홍길동' }, { label: '이메일', key: 'email', placeholder: 'name@arium.kr' }, { label: '초기 비밀번호', key: 'password', placeholder: '비밀번호 설정' }].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <label style={{ color: '#AAAAAA', fontSize: 11, display: 'block', marginBottom: 6 }}>{f.label}</label>
                <input value={(addForm as any)[f.key]} onChange={e => setAddForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} style={inputStyle} />
              </div>
            ))}
            <div style={{ marginBottom: 20 }}>
              <label style={{ color: '#AAAAAA', fontSize: 11, display: 'block', marginBottom: 6 }}>역할</label>
              <select value={addForm.role} onChange={e => setAddForm(p => ({ ...p, role: e.target.value as Role }))} style={inputStyle}>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <button onClick={handleAddUser} disabled={addLoading}
              style={{ width: '100%', background: addLoading ? '#E5E5E5' : 'linear-gradient(135deg, #FF6200, #CC4E00)', border: 'none', borderRadius: 10, color: addLoading ? '#AAAAAA' : '#fff', fontSize: 13, padding: '11px', cursor: addLoading ? 'not-allowed' : 'pointer', fontWeight: 700 }}>
              {addLoading ? '추가 중...' : '팀원 추가'}
            </button>
          </div>
        </div>
      )}

      {/* 정보 수정 모달 */}
      {editTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setEditTarget(null)}>
          <div style={{ background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: 18, padding: 28, width: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ color: '#111111', fontSize: 16, fontWeight: 700 }}>정보 수정</h2>
              <button onClick={() => setEditTarget(null)} style={{ background: 'none', border: 'none', color: '#CCCCCC', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            {[{ label: '이름', key: 'name' }, { label: '이메일', key: 'email' }].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <label style={{ color: '#AAAAAA', fontSize: 11, display: 'block', marginBottom: 6 }}>{f.label}</label>
                <input value={(editForm as any)[f.key]} onChange={e => setEditForm(p => ({ ...p, [f.key]: e.target.value }))} style={inputStyle} />
              </div>
            ))}
            <div style={{ marginBottom: 20 }}>
              <label style={{ color: '#AAAAAA', fontSize: 11, display: 'block', marginBottom: 6 }}>역할</label>
              <select value={editForm.role} onChange={e => setEditForm(p => ({ ...p, role: e.target.value as Role }))} style={inputStyle}>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <button onClick={handleEdit}
              style={{ width: '100%', background: 'linear-gradient(135deg, #FF6200, #CC4E00)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, padding: '11px', cursor: 'pointer', fontWeight: 700 }}>
              저장
            </button>
          </div>
        </div>
      )}

      {/* 비밀번호 변경 모달 */}
      {pwTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setPwTarget(null)}>
          <div style={{ background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: 18, padding: 28, width: 380, boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ color: '#111111', fontSize: 16, fontWeight: 700 }}>비밀번호 변경</h2>
              <button onClick={() => setPwTarget(null)} style={{ background: 'none', border: 'none', color: '#CCCCCC', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <p style={{ color: '#AAAAAA', fontSize: 12, marginBottom: 16 }}>
              {users.find(u => u.id === pwTarget)?.name}님의 비밀번호를 변경합니다
            </p>
            <div style={{ marginBottom: 20 }}>
              <label style={{ color: '#AAAAAA', fontSize: 11, display: 'block', marginBottom: 6 }}>새 비밀번호</label>
              <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="새 비밀번호 입력" style={inputStyle} />
            </div>
            <button onClick={handlePwChange} disabled={pwLoading || !newPw}
              style={{ width: '100%', background: !newPw || pwLoading ? '#E5E5E5' : 'linear-gradient(135deg, #FF6200, #CC4E00)', border: 'none', borderRadius: 10, color: !newPw || pwLoading ? '#AAAAAA' : '#fff', fontSize: 13, padding: '11px', cursor: !newPw || pwLoading ? 'not-allowed' : 'pointer', fontWeight: 700 }}>
              {pwLoading ? '변경 중...' : '변경 완료'}
            </button>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {deleteTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setDeleteTarget(null)}>
          <div style={{ background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: 18, padding: 28, width: 360, boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ color: '#111111', fontSize: 16, fontWeight: 700, marginBottom: 12 }}>팀원 삭제</h2>
            <p style={{ color: '#888888', fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
              <span style={{ color: '#EF4444', fontWeight: 600 }}>{users.find(u => u.id === deleteTarget)?.name}</span>님을 팀원에서 삭제할까요?<br />이 작업은 되돌릴 수 없습니다.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setDeleteTarget(null)}
                style={{ flex: 1, background: '#F5F5F5', border: '1px solid #EBEBEB', borderRadius: 10, color: '#888888', fontSize: 13, padding: '11px', cursor: 'pointer', fontWeight: 600 }}>
                취소
              </button>
              <button onClick={handleDelete}
                style={{ flex: 1, background: '#EF4444', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, padding: '11px', cursor: 'pointer', fontWeight: 700 }}>
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
