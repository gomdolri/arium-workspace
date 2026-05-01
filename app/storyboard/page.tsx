'use client';

import { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useApp } from '@/lib/context';
import { useIsMobile } from '@/lib/hooks';
import StoryboardSceneCard from '@/components/StoryboardSceneCard';
import { Plus } from 'lucide-react';

export default function StoryboardPage() {
  const { projects, storyboardScenes, addScene, updateScene, deleteScene } = useApp();
  const isMobile = useIsMobile();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');

  const activeProjects = projects.filter(p => p.status !== 'completed');

  const visibleScenes = storyboardScenes
    .filter(s => selectedProjectId === 'all' || s.projectId === selectedProjectId)
    .sort((a, b) => {
      if (a.projectId !== b.projectId) return a.projectId.localeCompare(b.projectId);
      return a.sceneOrder - b.sceneOrder;
    });

  const scenesByProject = activeProjects.reduce((acc, p) => {
    acc[p.id] = storyboardScenes.filter(s => s.projectId === p.id).sort((a, b) => a.sceneOrder - b.sceneOrder);
    return acc;
  }, {} as Record<string, typeof storyboardScenes>);

  return (
    <AppShell title="스토리보드">
      {/* 프로젝트 필터 */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        <button onClick={() => setSelectedProjectId('all')}
          style={{ background: selectedProjectId === 'all' ? 'rgba(255,98,0,0.08)' : '#FFFFFF', border: `1px solid ${selectedProjectId === 'all' ? '#FF6200' : '#EBEBEB'}`, color: selectedProjectId === 'all' ? '#FF6200' : '#888888', fontSize: 11, padding: '5px 14px', borderRadius: 6, cursor: 'pointer', fontWeight: selectedProjectId === 'all' ? 600 : 400 }}>
          전체
        </button>
        {activeProjects.map(p => (
          <button key={p.id} onClick={() => setSelectedProjectId(p.id)}
            style={{ background: selectedProjectId === p.id ? 'rgba(255,98,0,0.08)' : '#FFFFFF', border: `1px solid ${selectedProjectId === p.id ? '#FF6200' : '#EBEBEB'}`, color: selectedProjectId === p.id ? '#FF6200' : '#888888', fontSize: 11, padding: '5px 14px', borderRadius: 6, cursor: 'pointer', fontWeight: selectedProjectId === p.id ? 600 : 400 }}>
            {p.name}
          </button>
        ))}
      </div>

      {/* 전체 보기: 프로젝트별 섹션 */}
      {selectedProjectId === 'all' && (
        <>
          {activeProjects.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#CCCCCC' }}>
              <p style={{ fontSize: 32, marginBottom: 12 }}>🎬</p>
              <p style={{ fontSize: 13 }}>등록된 프로젝트가 없어요</p>
            </div>
          )}
          {activeProjects.map(p => (
            <div key={p.id} style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div>
                  <h3 style={{ color: '#111', fontSize: 15, fontWeight: 700 }}>{p.name}</h3>
                  <p style={{ color: '#AAAAAA', fontSize: 11, marginTop: 2 }}>{scenesByProject[p.id]?.length || 0}개의 씬</p>
                </div>
                <button onClick={() => addScene(p.id)}
                  style={{ background: 'linear-gradient(135deg, #FF6200, #CC4E00)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, padding: '7px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600 }}>
                  <Plus size={13} /> 씬 추가
                </button>
              </div>

              {(scenesByProject[p.id]?.length === 0) && (
                <div style={{ background: '#FAFAFA', border: '1px dashed #E0E0E0', borderRadius: 12, padding: '24px', textAlign: 'center', color: '#CCCCCC', fontSize: 12 }}>
                  씬 추가 버튼으로 첫 씬을 만들어보세요
                </div>
              )}

              {scenesByProject[p.id]?.map(scene => (
                <StoryboardSceneCard
                  key={scene.id}
                  scene={scene}
                  onUpdate={updates => updateScene(scene.id, updates)}
                  onDelete={() => deleteScene(scene.id)}
                />
              ))}
            </div>
          ))}
        </>
      )}

      {/* 특정 프로젝트 보기 */}
      {selectedProjectId !== 'all' && (() => {
        const project = projects.find(p => p.id === selectedProjectId);
        const scenes = scenesByProject[selectedProjectId] || [];
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <p style={{ color: '#AAAAAA', fontSize: 12 }}>{scenes.length}개의 씬</p>
              <button onClick={() => addScene(selectedProjectId)}
                style={{ background: 'linear-gradient(135deg, #FF6200, #CC4E00)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                <Plus size={14} /> 씬 추가
              </button>
            </div>

            {scenes.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#CCCCCC' }}>
                <p style={{ fontSize: 32, marginBottom: 12 }}>🎬</p>
                <p style={{ fontSize: 13 }}>아직 씬이 없어요</p>
                <p style={{ fontSize: 11, marginTop: 4 }}>씬 추가 버튼으로 스토리보드를 시작해보세요</p>
              </div>
            )}

            {scenes.map(scene => (
              <StoryboardSceneCard
                key={scene.id}
                scene={scene}
                onUpdate={updates => updateScene(scene.id, updates)}
                onDelete={() => deleteScene(scene.id)}
              />
            ))}
          </div>
        );
      })()}
    </AppShell>
  );
}
