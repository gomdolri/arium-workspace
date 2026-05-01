'use client';

import { useState } from 'react';
import { StoryboardScene } from '@/lib/types';
import { Trash2, ChevronDown, ChevronUp, Edit2, Check, X } from 'lucide-react';

interface Props {
  scene: StoryboardScene;
  onUpdate: (updates: Partial<StoryboardScene>) => void;
  onDelete: () => void;
}

const FIELDS = [
  { key: 'location' as const, label: '📍 장소 / 배경', multiline: false },
  { key: 'characters' as const, label: '👤 등장인물', multiline: false },
  { key: 'description' as const, label: '📋 상황 설명', multiline: true },
  { key: 'dialogue' as const, label: '💬 대사 / 나레이션', multiline: true },
  { key: 'cameraAngle' as const, label: '🎥 카메라 앵글', multiline: false },
  { key: 'mood' as const, label: '🎭 분위기 / 톤', multiline: false },
  { key: 'props' as const, label: '🎪 소품 / 의상', multiline: false },
  { key: 'duration' as const, label: '⏱ 예상 시간', multiline: false },
  { key: 'notes' as const, label: '📝 메모', multiline: true },
];

export default function StoryboardSceneCard({ scene, onUpdate, onDelete }: Props) {
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

  const save = () => { onUpdate(draft); setEditing(false); };
  const cancel = () => { setDraft({}); setEditing(false); };
  const hasContent = FIELDS.some(f => scene[f.key]);

  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,0.04)', marginBottom: 14 }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: '#FAFAFA', borderBottom: '1px solid #F0F0F0' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #FF6200, #CC4E00)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ color: '#fff', fontSize: 12, fontWeight: 800 }}>S{String(scene.sceneOrder).padStart(2, '0')}</span>
        </div>
        {editing ? (
          <input value={draft.title ?? ''} onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
            placeholder="씬 제목 (선택)"
            style={{ flex: 1, border: '1px solid #E0E0E0', borderRadius: 7, padding: '6px 10px', fontSize: 13, fontWeight: 600, outline: 'none' }} />
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
          {FIELDS.map(f => {
            const value = editing ? (draft[f.key] ?? '') : (scene[f.key] ?? '');
            if (!value && !editing) return null;
            return (
              <div key={f.key} style={{ gridColumn: f.multiline ? '1 / -1' : 'auto' }}>
                <p style={{ color: '#AAAAAA', fontSize: 10, fontWeight: 600, marginBottom: 5 }}>{f.label}</p>
                {editing ? (
                  f.multiline ? (
                    <textarea value={draft[f.key] ?? ''} onChange={e => setDraft(d => ({ ...d, [f.key]: e.target.value }))}
                      rows={3} style={{ width: '100%', border: '1px solid #E0E0E0', borderRadius: 7, padding: '8px 10px', fontSize: 12, outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', lineHeight: 1.6 }} />
                  ) : (
                    <input value={draft[f.key] ?? ''} onChange={e => setDraft(d => ({ ...d, [f.key]: e.target.value }))}
                      style={{ width: '100%', border: '1px solid #E0E0E0', borderRadius: 7, padding: '8px 10px', fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
                  )
                ) : (
                  <p style={{ color: '#333', fontSize: 12, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{value as string}</p>
                )}
              </div>
            );
          })}
          {!editing && !hasContent && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '16px 0', color: '#CCCCCC', fontSize: 12 }}>
              ✏️ 버튼을 눌러 내용을 채워주세요
            </div>
          )}
        </div>
      )}
    </div>
  );
}
