'use client';

import { use, useState, useRef, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useApp } from '@/lib/context';
import { getStatusColor, getStatusLabel } from '@/lib/store';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, ChevronDown, ChevronUp, Edit2, Check, X } from 'lucide-react';
import { StoryboardScene } from '@/lib/types';

function SceneCard({ scene, onUpdate, onDelete }: {
  scene: StoryboardScene;
  onUpdate: (updates: Partial<StoryboardScene>) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [draft, setDraft] = useState<Partial<StoryboardScene>>({});

  const startEdit = () => {
    setDraft({
      title: scene.title || '',
      location: scene.location || '',
      characters: scene.characters || '',
      description: scene.description || '',
      dialogue: scene.dialogue || '',
      cameraAngle: scene.cameraAngle || '',
      mood: scene.mood || '',
      props: scene.props || '',
      duration: scene.duration || '',
      notes: scene.notes || '',
    });
    setEditing(true);
    setCollapsed(false);
  };

  const save = () => {
    onUpdate(draft);
    setEditing(false);
  };

  const cancel = () => {
    setDraft({});
    setEditing(false);
  };

  const fields = [
    { key: 'location', label: '📍 장소 / 배경', multiline: false },
    { key: 'characters', label: '👤 등장인물', multiline: false },
    { key: 'description', label: '📋 상황 설명', multiline: true },
    { key: 'dialogue', label: '💬 대사 / 나레이션', multiline: true },
    { key: 'cameraAngle', label: '🎥 카메라 앵글', multiline: false },
    { key: 'mood', label: '🎭 분위기 / 톤', multiline: false },
    { key: 'props', label: '🎪 소품 / 의상', multiline: false },
    { key: 'duration', label: '⏱ 예상 시간', multiline: false },
    { key: 'notes', label: '📝 메모', multiline: true },
  ] as const;

  const hasContent = fields.some(f => scene[f.key]);

  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,0.04)', marginBottom: 14 }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: '#FAFAFA', borderBottom: '1px solid #F0F0F0' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #FF6200, #CC4E00)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ color: '#fff', fontSize: 12, fontWeight: 800 }}>S{String(scene.sceneOrder).padStart(2, '0')}</span>
        </div>
        {editing ? (
          <input
            value={draft.title ?? ''}
            onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
            placeholder="씬 제목 (선택)"
            style={{ flex: 1, border: '1px solid #E0E0E0', borderRadius: 7, padding: '6px 10px', fontSize: 13, fontWeight: 600, outline: 'none' }}
          />
        ) : (
          <span style={{ flex: 1, color: scene.title ? '#111' : '#CCCCCC', fontSize: 13, fontWeight: 600 }}>
            {scene.title || '제목 없음'}
          </span>
        )}
        <div style={{ display: 'flex', gap: 6 }}>
          {editing ? (
            <>
              <button onClick={save} style={{ background: '#FF6200', border: 'none', borderRadius: 7, padding: '6px 12px', cursor: 'pointer', color: '#fff', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Check size={12} /> 저장
              </button>
              <button onClick={cancel} style={{ background: '#F0F0F0', border: 'none', borderRadius: 7, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <X size={14} color="#888" />
              </button>
            </>
          ) : (
            <>
              <button onClick={startEdit} style={{ background: '#F0F0F0', border: 'none', borderRadius: 7, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <Edit2 size={13} color="#888" />
              </button>
              <button onClick={onDelete} style={{ background: '#FEF2F2', border: 'none', borderRadius: 7, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <Trash2 size={13} color="#EF4444" />
              </button>
              {hasContent && (
                <button onClick={() => setCollapsed(c => !c)} style={{ background: '#F0F0F0', border: 'none', borderRadius: 7, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  {collapsed ? <ChevronDown size={14} color="#888" /> : <ChevronUp size={14} color="#888" />}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* 필드들 */}
      {!collapsed && (
        <div style={{ padding: '16px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {fields.map(f => {
            const value = editing ? (draft[f.key] ?? '') : (scene[f.key] ?? '');
            const isEmpty = !value && !editing;
            if (isEmpty) return null;

            return (
              <div key={f.key} style={{ gridColumn: f.multiline ? '1 / -1' : 'auto' }}>
                <p style={{ color: '#AAAAAA', fontSize: 10, fontWeight: 600, marginBottom: 5 }}>{f.label}</p>
                {editing ? (
                  f.multiline ? (
                    <textarea
                      value={draft[f.key] ?? ''}
                      onChange={e => setDraft(d => ({ ...d, [f.key]: e.target.value }))}
                      rows={3}
                      style={{ width: '100%', border: '1px solid #E0E0E0', borderRadius: 7, padding: '8px 10px', fontSize: 12, outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', lineHeight: 1.6 }}
                    />
                  ) : (
                    <input
                      value={draft[f.key] ?? ''}
                      onChange={e => setDraft(d => ({ ...d, [f.key]: e.target.value }))}
                      style={{ width: '100%', border: '1px solid #E0E0E0', borderRadius: 7, padding: '8px 10px', fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
                    />
                  )
                ) : (
                  <p style={{ color: '#333', fontSize: 12, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{value as string}</p>
                )}
              </div>
            );
          })}

          {/* 편집 모드에서 빈 필드도 다 보여주기 */}
          {editing && fields.filter(f => !f.multiline).map(f => {
            if (draft[f.key] !== undefined) return null;
            return null;
          })}

          {!editing && !hasContent && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '16px 0', color: '#CCCCCC', fontSize: 12 }}>
              편집 버튼을 눌러 내용을 채워주세요
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { projects, tasks, productions, deliveries, users, updateProject, storyboardScenes, addScene, updateScene, deleteScene } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'storyboard'>('overview');

  const project = projects.find(p => p.id === id);
  if (!project) return <AppShell title="프로젝트"><p style={{ color: '#AAAAAA' }}>프로젝트를 찾을 수 없습니다.</p></AppShell>;

  const projectTasks = tasks.filter(t => t.projectId === id);
  const projectProductions = productions.filter(p => p.projectId === id);
  const projectDeliveries = deliveries.filter(d => d.projectId === id);
  const projectScenes = storyboardScenes.filter(s => s.projectId === id).sort((a, b) => a.sceneOrder - b.sceneOrder);
  const statusColor = getStatusColor(project.status);

  return (
    <AppShell title={project.name}>
      <Link href="/projects" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#AAAAAA', fontSize: 12, textDecoration: 'none', marginBottom: 20 }}>
        <ArrowLeft size={14} /> 프로젝트 목록
      </Link>

      {/* 프로젝트 헤더 */}
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

      {/* 탭 */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#F0F0F0', padding: 4, borderRadius: 10, width: 'fit-content', border: '1px solid #EBEBEB' }}>
        {[{ key: 'overview', label: '개요' }, { key: 'storyboard', label: `스토리보드 ${projectScenes.length > 0 ? `(${projectScenes.length})` : ''}` }].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
            style={{ background: activeTab === tab.key ? '#FF6200' : 'transparent', border: 'none', borderRadius: 7, color: activeTab === tab.key ? '#fff' : '#888888', fontSize: 12, padding: '7px 18px', cursor: 'pointer', fontWeight: 600 }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* 개요 탭 */}
      {activeTab === 'overview' && (
        <>
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
        </>
      )}

      {/* 스토리보드 탭 */}
      {activeTab === 'storyboard' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <p style={{ color: '#AAAAAA', fontSize: 12 }}>씬을 추가하고 각 카드의 ✏️ 버튼으로 내용을 채워주세요</p>
            <button onClick={() => addScene(id)}
              style={{ background: 'linear-gradient(135deg, #FF6200, #CC4E00)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, flexShrink: 0 }}>
              <Plus size={14} /> 씬 추가
            </button>
          </div>

          {projectScenes.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#CCCCCC' }}>
              <p style={{ fontSize: 32, marginBottom: 12 }}>🎬</p>
              <p style={{ fontSize: 13 }}>아직 씬이 없어요</p>
              <p style={{ fontSize: 11, marginTop: 4 }}>씬 추가 버튼으로 스토리보드를 시작해보세요</p>
            </div>
          )}

          {projectScenes.map(scene => (
            <SceneCard
              key={scene.id}
              scene={scene}
              onUpdate={updates => updateScene(scene.id, updates)}
              onDelete={() => deleteScene(scene.id)}
            />
          ))}
        </div>
      )}
    </AppShell>
  );
}
