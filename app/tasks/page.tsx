'use client';

import { useState, useRef } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useApp } from '@/lib/context';
import { getUser, getStatusColor, getStatusLabel } from '@/lib/store';
import { Task, TaskStatus } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { Plus, X, Trash2, Upload, FileText, Image, Film, File, Paperclip } from 'lucide-react';

const COLUMNS: { key: TaskStatus; label: string }[] = [
  { key: 'todo', label: '할 일' },
  { key: 'inprogress', label: '진행 중' },
  { key: 'review', label: '검토 중' },
  { key: 'done', label: '완료' },
];

function FileIcon({ type }: { type: string }) {
  if (type.startsWith('image')) return <Image size={14} color="#6366F1" />;
  if (type.startsWith('video')) return <Film size={14} color="#FF6200" />;
  if (type.includes('pdf') || type.includes('document')) return <FileText size={14} color="#F59E0B" />;
  return <File size={14} color="#888" />;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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
        <span style={{ background: `${priorityColor}12`, color: priorityColor, fontSize: 9, padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
          {task.priority === 'high' ? 'HIGH' : task.priority === 'medium' ? 'MID' : 'LOW'}
        </span>
        {task.dueDate && <span style={{ color: '#CCCCCC', fontSize: 10 }}>{format(parseISO(task.dueDate), 'M/d')}</span>}
      </div>
      <p style={{ color: '#111111', fontSize: 12, fontWeight: 500, marginBottom: 8, lineHeight: 1.4 }}>{task.title}</p>
      {task.progress > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: '#CCCCCC', fontSize: 9 }}>진행률</span>
            <span style={{ color: '#FF6200', fontSize: 9 }}>{task.progress}%</span>
          </div>
          <div style={{ background: '#F0F0F0', borderRadius: 4, height: 2 }}>
            <div style={{ background: 'linear-gradient(90deg, #FF6200, #FF7A1A)', width: `${task.progress}%`, height: '100%', borderRadius: 4 }} />
          </div>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'linear-gradient(135deg, #FF6200, #CC4E00)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#fff', fontWeight: 700 }}>
          {assignee?.name[0]}
        </div>
        <span style={{ color: '#AAAAAA', fontSize: 10 }}>{assignee?.name}</span>
        <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
          {task.attachments.length > 0 && <span style={{ color: '#CCCCCC', fontSize: 10 }}><Paperclip size={10} style={{ display: 'inline', marginRight: 2 }} />{task.attachments.length}</span>}
          {task.comments.length > 0 && <span style={{ color: '#CCCCCC', fontSize: 10 }}>💬 {task.comments.length}</span>}
        </div>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const { tasks, projects, users, currentUser, updateTask, addTask, addComment, deleteTask, addAttachment } = useApp();
  const [filterProject, setFilterProject] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newComment, setNewComment] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', projectId: '', assigneeId: '', priority: 'medium', dueDate: '', description: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editDesc, setEditDesc] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

  const filtered = tasks.filter(t => filterProject === 'all' || t.projectId === filterProject);
  const currentTaskData = selectedTask ? tasks.find(t => t.id === selectedTask.id) || selectedTask : null;

  const openTask = (task: Task) => {
    setSelectedTask(task);
    setEditTitle(task.title);
    setEditDesc(task.description || '');
    setIsEditingDesc(false);
    setShowDeleteConfirm(false);
  };

  const handleSaveTitle = () => {
    if (!selectedTask || !editTitle.trim()) return;
    updateTask(selectedTask.id, { title: editTitle });
  };

  const handleSaveDesc = () => {
    if (!selectedTask) return;
    updateTask(selectedTask.id, { description: editDesc });
    setIsEditingDesc(false);
  };

  const handleDelete = async () => {
    if (!selectedTask) return;
    await deleteTask(selectedTask.id);
    setSelectedTask(null);
    setShowDeleteConfirm(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedTask || !e.target.files?.length) return;
    setUploadError('');
    const oversized = Array.from(e.target.files).filter(f => f.size > MAX_FILE_SIZE);
    if (oversized.length > 0) {
      setUploadError(`파일 크기 초과 (최대 500MB): ${oversized.map(f => f.name).join(', ')}`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setUploadLoading(true);
    for (const file of Array.from(e.target.files)) {
      await addAttachment(selectedTask.id, file);
    }
    setUploadLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddTask = () => {
    if (!newTask.title || !newTask.projectId) return;
    addTask({ ...newTask, status: 'todo', priority: newTask.priority as any, progress: 0, assigneeId: newTask.assigneeId || currentUser!.id });
    setNewTask({ title: '', projectId: '', assigneeId: '', priority: 'medium', dueDate: '', description: '' });
    setShowAddTask(false);
  };

  const inputStyle = { width: '100%', background: '#F7F7F7', border: '1px solid #EBEBEB', borderRadius: 8, padding: '9px 12px', color: '#111111', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const };

  return (
    <AppShell title="작업 보드">
      {/* Filter + Add */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['all', ...projects.map(p => p.id)].map(id => {
            const label = id === 'all' ? '전체' : projects.find(p => p.id === id)?.name || '';
            return (
              <button key={id} onClick={() => setFilterProject(id)}
                style={{ background: filterProject === id ? 'rgba(255,98,0,0.08)' : '#FFFFFF', border: `1px solid ${filterProject === id ? '#FF6200' : '#EBEBEB'}`, color: filterProject === id ? '#FF6200' : '#888888', fontSize: 12, padding: '6px 14px', borderRadius: 8, cursor: 'pointer' }}>
                {label}
              </button>
            );
          })}
        </div>
        <button onClick={() => setShowAddTask(true)}
          style={{ background: 'linear-gradient(135deg, #FF6200, #CC4E00)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, boxShadow: '0 2px 12px rgba(255,98,0,0.2)' }}>
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
                <span style={{ background: '#F0F0F0', color: '#AAAAAA', fontSize: 10, padding: '1px 6px', borderRadius: 10, marginLeft: 2 }}>{colTasks.length}</span>
              </div>
              <div style={{ background: '#F0F0F0', borderRadius: 10, padding: 8, minHeight: 200 }}>
                {colTasks.map(t => <TaskCard key={t.id} task={t} onClick={() => openTask(t)} />)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Detail Modal */}
      {currentTaskData && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
          onClick={() => { setSelectedTask(null); setShowDeleteConfirm(false); }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: 18, padding: 28, width: '100%', maxWidth: 560, maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
            onClick={e => e.stopPropagation()}>

            {/* 헤더 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <input
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                onBlur={handleSaveTitle}
                style={{ color: '#111111', fontSize: 16, fontWeight: 700, background: 'none', border: 'none', outline: 'none', flex: 1, marginRight: 12, padding: 0 }}
              />
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => setShowDeleteConfirm(true)}
                  style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', color: '#EF4444', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                  <Trash2 size={12} /> 삭제
                </button>
                <button onClick={() => setSelectedTask(null)} style={{ background: 'none', border: 'none', color: '#CCCCCC', cursor: 'pointer' }}><X size={18} /></button>
              </div>
            </div>

            {/* 삭제 확인 */}
            {showDeleteConfirm && (
              <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
                <p style={{ color: '#EF4444', fontSize: 13, marginBottom: 10 }}>이 작업을 삭제할까요?</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={handleDelete} style={{ background: '#EF4444', border: 'none', borderRadius: 6, color: '#fff', fontSize: 12, padding: '6px 14px', cursor: 'pointer', fontWeight: 600 }}>삭제</button>
                  <button onClick={() => setShowDeleteConfirm(false)} style={{ background: '#F5F5F5', border: '1px solid #EBEBEB', borderRadius: 6, color: '#888', fontSize: 12, padding: '6px 14px', cursor: 'pointer' }}>취소</button>
                </div>
              </div>
            )}

            {/* 상태 변경 */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
              {COLUMNS.map(col => (
                <button key={col.key} onClick={() => updateTask(currentTaskData.id, { status: col.key })}
                  style={{ background: currentTaskData.status === col.key ? `${getStatusColor(col.key)}12` : '#F7F7F7', border: `1px solid ${currentTaskData.status === col.key ? getStatusColor(col.key) : '#EBEBEB'}`, color: currentTaskData.status === col.key ? getStatusColor(col.key) : '#888888', fontSize: 11, padding: '5px 12px', borderRadius: 6, cursor: 'pointer' }}>
                  {col.label}
                </button>
              ))}
            </div>

            {/* 진행률 */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: '#AAAAAA', fontSize: 11 }}>진행률</span>
                <span style={{ color: '#FF6200', fontSize: 11, fontWeight: 700 }}>{currentTaskData.progress}%</span>
              </div>
              <input type="range" min={0} max={100} value={currentTaskData.progress}
                onChange={e => updateTask(currentTaskData.id, { progress: Number(e.target.value) })}
                style={{ width: '100%', accentColor: '#FF6200' }} />
            </div>

            {/* 설명 */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ color: '#AAAAAA', fontSize: 11 }}>설명</span>
                {!isEditingDesc && (
                  <button onClick={() => setIsEditingDesc(true)}
                    style={{ background: 'none', border: 'none', color: '#FF6200', fontSize: 11, cursor: 'pointer' }}>편집</button>
                )}
              </div>
              {isEditingDesc ? (
                <div>
                  <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={4}
                    placeholder="작업 설명을 입력하세요..."
                    style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    <button onClick={handleSaveDesc} style={{ background: '#FF6200', border: 'none', borderRadius: 6, color: '#fff', fontSize: 12, padding: '6px 14px', cursor: 'pointer', fontWeight: 600 }}>저장</button>
                    <button onClick={() => { setIsEditingDesc(false); setEditDesc(currentTaskData.description || ''); }}
                      style={{ background: '#F5F5F5', border: '1px solid #EBEBEB', borderRadius: 6, color: '#888', fontSize: 12, padding: '6px 14px', cursor: 'pointer' }}>취소</button>
                  </div>
                </div>
              ) : (
                <div onClick={() => setIsEditingDesc(true)}
                  style={{ background: '#F7F7F7', borderRadius: 8, padding: '10px 12px', border: '1px solid #EBEBEB', cursor: 'text', minHeight: 60 }}>
                  {currentTaskData.description
                    ? <p style={{ color: '#444444', fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{currentTaskData.description}</p>
                    : <p style={{ color: '#CCCCCC', fontSize: 13 }}>설명을 입력하려면 클릭하세요...</p>
                  }
                </div>
              )}
            </div>

            {/* 파일 첨부 */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ color: '#AAAAAA', fontSize: 11 }}>첨부파일 ({currentTaskData.attachments.length})</span>
                <div>
                  <input type="file" ref={fileInputRef} multiple onChange={handleFileUpload} style={{ display: 'none' }} />
                  {uploadError && (
                    <p style={{ color: '#EF4444', fontSize: 11, marginBottom: 6 }}>{uploadError}</p>
                  )}
                  <button onClick={() => { setUploadError(''); fileInputRef.current?.click(); }} disabled={uploadLoading}
                    style={{ background: 'none', border: '1px solid #EBEBEB', borderRadius: 6, color: uploadLoading ? '#CCCCCC' : '#888888', fontSize: 11, padding: '4px 10px', cursor: uploadLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Upload size={11} /> {uploadLoading ? '업로드 중...' : '파일 추가'}
                  </button>
                </div>
              </div>
              {currentTaskData.attachments.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {currentTaskData.attachments.map(att => (
                    <a key={att.id} href={att.url} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F7F7F7', border: '1px solid #EBEBEB', borderRadius: 8, padding: '8px 12px', textDecoration: 'none' }}>
                      <FileIcon type={att.type} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ color: '#111111', fontSize: 12, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{att.name}</p>
                        <p style={{ color: '#CCCCCC', fontSize: 10 }}>{formatBytes(att.size)}</p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
              {currentTaskData.attachments.length === 0 && (
                <div onClick={() => fileInputRef.current?.click()}
                  style={{ border: '2px dashed #E0E0E0', borderRadius: 8, padding: '16px', textAlign: 'center', cursor: 'pointer', color: '#CCCCCC', fontSize: 12 }}>
                  파일을 드래그하거나 클릭해서 첨부
                </div>
              )}
            </div>

            {/* 댓글 */}
            <div style={{ borderTop: '1px solid #F5F5F5', paddingTop: 16 }}>
              <p style={{ color: '#AAAAAA', fontSize: 11, marginBottom: 12 }}>댓글 ({currentTaskData.comments.length})</p>
              {currentTaskData.comments.map(c => {
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
                  onKeyDown={e => { if (e.key === 'Enter' && newComment.trim()) { addComment(currentTaskData.id, newComment.trim()); setNewComment(''); } }}
                  style={{ flex: 1, background: '#F7F7F7', border: '1px solid #EBEBEB', borderRadius: 8, padding: '8px 12px', color: '#111111', fontSize: 12, outline: 'none' }} />
                <button onClick={() => { if (newComment.trim()) { addComment(currentTaskData.id, newComment.trim()); setNewComment(''); } }}
                  style={{ background: '#FF6200', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, padding: '8px 14px', cursor: 'pointer' }}>전송</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 작업 추가 모달 */}
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
              <label style={{ color: '#AAAAAA', fontSize: 11, display: 'block', marginBottom: 6 }}>설명</label>
              <textarea value={newTask.description} onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))} placeholder="작업 설명 (선택사항)" rows={3} style={{ ...inputStyle, resize: 'none' }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ color: '#AAAAAA', fontSize: 11, display: 'block', marginBottom: 6 }}>프로젝트</label>
              <select value={newTask.projectId} onChange={e => setNewTask(p => ({ ...p, projectId: e.target.value }))} style={inputStyle}>
                <option value="">프로젝트 선택</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ color: '#AAAAAA', fontSize: 11, display: 'block', marginBottom: 6 }}>담당자</label>
              <select value={newTask.assigneeId} onChange={e => setNewTask(p => ({ ...p, assigneeId: e.target.value }))} style={inputStyle}>
                <option value="">담당자 선택</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div>
                <label style={{ color: '#AAAAAA', fontSize: 11, display: 'block', marginBottom: 6 }}>우선순위</label>
                <select value={newTask.priority} onChange={e => setNewTask(p => ({ ...p, priority: e.target.value }))} style={inputStyle}>
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
