'use client';

import { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useApp } from '@/lib/context';
import { getUser, getStatusColor, getStatusLabel } from '@/lib/store';
import { Task, TaskStatus } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { Plus, X } from 'lucide-react';

const COLUMNS: { key: TaskStatus; label: string }[] = [
  { key: 'todo', label: '할 일' },
  { key: 'inprogress', label: '진행 중' },
  { key: 'review', label: '검토 중' },
  { key: 'done', label: '완료' },
];

function TaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
  const assignee = getUser(task.assigneeId);
  const priorityColor = getStatusColor(task.priority);

  return (
    <div onClick={onClick} style={{
      background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: 10,
      padding: '12px 14px', marginBottom: 8, cursor: 'pointer',
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{
          background: `${priorityColor}12`, color: priorityColor,
          fontSize: 9, padding: '2px 6px', borderRadius: 4, fontWeight: 700,
        }}>
          {task.priority === 'high' ? 'HIGH' : task.priority === 'medium' ? 'MID' : 'LOW'}
        </span>
        {task.dueDate && (
          <span style={{ color: '#CCCCCC', fontSize: 10 }}>
            {format(parseISO(task.dueDate), 'M/d')}
          </span>
        )}
      </div>
      <p style={{ color: '#111111', fontSize: 12, fontWeight: 500, marginBottom: 8, lineHeight: 1.4 }}>
        {task.title}
      </p>
      {task.progress > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: '#CCCCCC', fontSize: 9 }}>진행률</span>
            <span style={{ color: '#FF6200', fontSize: 9 }}>{task.progress}%</span>
          </div>
          <div style={{ background: '#F0F0F0', borderRadius: 4, height: 2 }}>
            <div style={{
              background: 'linear-gradient(90deg, #FF6200, #FF7A1A)',
              width: `${task.progress}%`, height: '100%', borderRadius: 4,
            }} />
          </div>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 20, height: 20, borderRadius: '50%',
          background: 'linear-gradient(135deg, #FF6200, #CC4E00)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 8, color: '#fff', fontWeight: 700,
        }}>
          {assignee?.name[0]}
        </div>
        <span style={{ color: '#AAAAAA', fontSize: 10 }}>{assignee?.name}</span>
        {task.comments.length > 0 && (
          <span style={{ color: '#CCCCCC', fontSize: 10, marginLeft: 'auto' }}>
            💬 {task.comments.length}
          </span>
        )}
      </div>
    </div>
  );
}

export default function TasksPage() {
  const { tasks, projects, users, currentUser, updateTask, addTask, addComment } = useApp();
  const [filterProject, setFilterProject] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newComment, setNewComment] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', projectId: '', assigneeId: '', priority: 'medium', dueDate: '', progress: 0 });

  const filtered = tasks.filter(t => filterProject === 'all' || t.projectId === filterProject);

  const handleAddTask = () => {
    if (!newTask.title || !newTask.projectId) return;
    addTask({ ...newTask, status: 'todo', priority: newTask.priority as any, progress: 0, assigneeId: newTask.assigneeId || currentUser!.id });
    setNewTask({ title: '', projectId: '', assigneeId: '', priority: 'medium', dueDate: '', progress: 0 });
    setShowAddTask(false);
  };

  const inputStyle = {
    width: '100%', background: '#F7F7F7', border: '1px solid #EBEBEB',
    borderRadius: 8, padding: '9px 12px', color: '#111111',
    fontSize: 13, outline: 'none', boxSizing: 'border-box' as const,
  };

  const selectStyle = {
    ...inputStyle, cursor: 'pointer',
  };

  return (
    <AppShell title="작업 보드">
      {/* Filter + Add */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button onClick={() => setFilterProject('all')}
            style={{
              background: filterProject === 'all' ? 'rgba(255,98,0,0.08)' : '#FFFFFF',
              border: `1px solid ${filterProject === 'all' ? '#FF6200' : '#EBEBEB'}`,
              color: filterProject === 'all' ? '#FF6200' : '#888888',
              fontSize: 12, padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
            }}>
            전체
          </button>
          {projects.map(p => (
            <button key={p.id} onClick={() => setFilterProject(p.id)}
              style={{
                background: filterProject === p.id ? 'rgba(255,98,0,0.08)' : '#FFFFFF',
                border: `1px solid ${filterProject === p.id ? '#FF6200' : '#EBEBEB'}`,
                color: filterProject === p.id ? '#FF6200' : '#888888',
                fontSize: 12, padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
              }}>
              {p.name}
            </button>
          ))}
        </div>
        <button onClick={() => setShowAddTask(true)}
          style={{
            background: 'linear-gradient(135deg, #FF6200, #CC4E00)',
            border: 'none', borderRadius: 8, color: '#fff',
            fontSize: 12, padding: '8px 16px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600,
            boxShadow: '0 2px 12px rgba(255,98,0,0.2)',
          }}>
          <Plus size={14} /> 작업 추가
        </button>
      </div>

      {/* Kanban */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {COLUMNS.map(col => {
          const colTasks = filtered.filter(t => t.status === col.key);
          return (
            <div key={col.key}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: getStatusColor(col.key) }} />
                <span style={{ color: '#555555', fontSize: 12, fontWeight: 600 }}>{col.label}</span>
                <span style={{ background: '#F0F0F0', color: '#AAAAAA', fontSize: 10, padding: '1px 6px', borderRadius: 10, marginLeft: 2 }}>
                  {colTasks.length}
                </span>
              </div>
              <div style={{ background: '#F0F0F0', borderRadius: 10, padding: '8px', minHeight: 200 }}>
                {colTasks.map(t => (
                  <TaskCard key={t.id} task={t} onClick={() => setSelectedTask(t)} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
          onClick={() => setSelectedTask(null)}>
          <div style={{
            background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: 18,
            padding: 28, width: '100%', maxWidth: 520, maxHeight: '80vh', overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ color: '#111111', fontSize: 16, fontWeight: 700 }}>{selectedTask.title}</h2>
              <button onClick={() => setSelectedTask(null)} style={{ background: 'none', border: 'none', color: '#CCCCCC', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            {selectedTask.description && (
              <p style={{ color: '#888888', fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>{selectedTask.description}</p>
            )}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: '#AAAAAA', fontSize: 11 }}>진행률</span>
                <span style={{ color: '#FF6200', fontSize: 11, fontWeight: 700 }}>{selectedTask.progress}%</span>
              </div>
              <input type="range" min={0} max={100} value={selectedTask.progress}
                onChange={e => updateTask(selectedTask.id, { progress: Number(e.target.value) })}
                style={{ width: '100%', accentColor: '#FF6200' }} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {COLUMNS.map(col => (
                <button key={col.key}
                  onClick={() => updateTask(selectedTask.id, { status: col.key })}
                  style={{
                    background: selectedTask.status === col.key ? `${getStatusColor(col.key)}12` : '#F7F7F7',
                    border: `1px solid ${selectedTask.status === col.key ? getStatusColor(col.key) : '#EBEBEB'}`,
                    color: selectedTask.status === col.key ? getStatusColor(col.key) : '#888888',
                    fontSize: 11, padding: '5px 12px', borderRadius: 6, cursor: 'pointer',
                  }}>
                  {col.label}
                </button>
              ))}
            </div>
            <div style={{ borderTop: '1px solid #F5F5F5', paddingTop: 16 }}>
              <p style={{ color: '#AAAAAA', fontSize: 11, marginBottom: 12 }}>댓글 ({selectedTask.comments.length})</p>
              {selectedTask.comments.map(c => {
                const u = getUser(c.userId);
                return (
                  <div key={c.id} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #FF6200, #CC4E00)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', fontWeight: 700, flexShrink: 0 }}>{u?.name[0]}</div>
                    <div style={{ background: '#F7F7F7', borderRadius: 8, padding: '8px 12px', flex: 1 }}>
                      <p style={{ color: '#FF6200', fontSize: 10, marginBottom: 4 }}>{u?.name}</p>
                      <p style={{ color: '#444444', fontSize: 12 }}>{c.text}</p>
                    </div>
                  </div>
                );
              })}
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={newComment} onChange={e => setNewComment(e.target.value)}
                  placeholder="댓글 입력..."
                  onKeyDown={e => { if (e.key === 'Enter' && newComment.trim()) { addComment(selectedTask.id, newComment.trim()); setNewComment(''); } }}
                  style={{ flex: 1, background: '#F7F7F7', border: '1px solid #EBEBEB', borderRadius: 8, padding: '8px 12px', color: '#111111', fontSize: 12, outline: 'none' }} />
                <button onClick={() => { if (newComment.trim()) { addComment(selectedTask.id, newComment.trim()); setNewComment(''); } }}
                  style={{ background: '#FF6200', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, padding: '8px 14px', cursor: 'pointer' }}>전송</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
          onClick={() => setShowAddTask(false)}>
          <div style={{ background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: 18, padding: 28, width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ color: '#111111', fontSize: 16, fontWeight: 700 }}>새 작업 추가</h2>
              <button onClick={() => setShowAddTask(false)} style={{ background: 'none', border: 'none', color: '#CCCCCC', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ color: '#AAAAAA', fontSize: 11, display: 'block', marginBottom: 6 }}>작업명</label>
              <input value={newTask.title} onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))} placeholder="작업 제목 입력" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ color: '#AAAAAA', fontSize: 11, display: 'block', marginBottom: 6 }}>프로젝트</label>
              <select value={newTask.projectId} onChange={e => setNewTask(p => ({ ...p, projectId: e.target.value }))} style={selectStyle}>
                <option value="">프로젝트 선택</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ color: '#AAAAAA', fontSize: 11, display: 'block', marginBottom: 6 }}>담당자</label>
              <select value={newTask.assigneeId} onChange={e => setNewTask(p => ({ ...p, assigneeId: e.target.value }))} style={selectStyle}>
                <option value="">담당자 선택</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div>
                <label style={{ color: '#AAAAAA', fontSize: 11, display: 'block', marginBottom: 6 }}>우선순위</label>
                <select value={newTask.priority} onChange={e => setNewTask(p => ({ ...p, priority: e.target.value }))} style={selectStyle}>
                  <option value="low">낮음</option>
                  <option value="medium">보통</option>
                  <option value="high">높음</option>
                </select>
              </div>
              <div>
                <label style={{ color: '#AAAAAA', fontSize: 11, display: 'block', marginBottom: 6 }}>마감일</label>
                <input type="date" value={newTask.dueDate} onChange={e => setNewTask(p => ({ ...p, dueDate: e.target.value }))} style={{ ...inputStyle, colorScheme: 'light' }} />
              </div>
            </div>
            <button onClick={handleAddTask}
              style={{ width: '100%', background: 'linear-gradient(135deg, #FF6200, #CC4E00)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, padding: '11px', cursor: 'pointer', fontWeight: 700, boxShadow: '0 4px 16px rgba(255,98,0,0.2)' }}>
              작업 추가
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
