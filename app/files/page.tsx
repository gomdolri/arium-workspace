'use client';

import { useState, useRef } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useApp } from '@/lib/context';
import { Upload, Image, Film, FileText, File, X, Plus } from 'lucide-react';

interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  projectId: string;
  category: 'design' | 'video' | 'document' | 'reference';
  uploadedBy: string;
  uploadedAt: string;
  url: string;
  tags?: string[];
}

const MOCK_FILES: FileItem[] = [];

const REF_BOARD: { id: string; projectId: string; title: string; description: string; color: string; tags: string[] }[] = [];

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function FileIcon({ type }: { type: string }) {
  if (type.startsWith('image')) return <Image size={20} color="#6366F1" />;
  if (type.startsWith('video')) return <Film size={20} color="#FF6200" />;
  if (type.includes('pdf') || type.includes('document')) return <FileText size={20} color="#F59E0B" />;
  return <File size={20} color="#555" />;
}

export default function FilesPage() {
  const { projects, users, currentUser } = useApp();
  const [files, setFiles] = useState<FileItem[]>(MOCK_FILES);
  const [filterProject, setFilterProject] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [activeTab, setActiveTab] = useState<'files' | 'reference'>('files');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = files.filter(f => {
    if (filterProject !== 'all' && f.projectId !== filterProject) return false;
    if (filterCategory !== 'all' && f.category !== filterCategory) return false;
    return true;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(e.target.files || []);
    uploadedFiles.forEach(file => {
      const category: FileItem['category'] =
        file.type.startsWith('image') ? 'design' :
          file.type.startsWith('video') ? 'video' : 'document';
      setFiles(prev => [...prev, {
        id: Math.random().toString(36).slice(2),
        name: file.name,
        type: file.type,
        size: file.size,
        projectId: filterProject === 'all' ? 'p1' : filterProject,
        category,
        uploadedBy: currentUser!.id,
        uploadedAt: new Date().toISOString().slice(0, 10),
        url: URL.createObjectURL(file),
        tags: [],
      }]);
    });
  };

  return (
    <AppShell title="파일 / 레퍼런스">
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#F0F0F0', padding: 4, borderRadius: 10, width: 'fit-content', border: '1px solid #EBEBEB' }}>
        {[{ key: 'files', label: '파일' }, { key: 'reference', label: '레퍼런스 보드' }].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
            style={{
              background: activeTab === tab.key ? '#FF6200' : 'transparent',
              border: 'none', borderRadius: 7, color: activeTab === tab.key ? '#fff' : '#888888',
              fontSize: 12, padding: '7px 18px', cursor: 'pointer', fontWeight: 600,
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'files' && (
        <>
          {/* Filters + Upload */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={() => setFilterProject('all')}
                style={{ background: filterProject === 'all' ? 'rgba(255,98,0,0.08)' : '#FFFFFF', border: `1px solid ${filterProject === 'all' ? '#FF6200' : '#EBEBEB'}`, color: filterProject === 'all' ? '#FF6200' : '#888888', fontSize: 11, padding: '5px 12px', borderRadius: 6, cursor: 'pointer' }}>
                전체
              </button>
              {projects.map(p => (
                <button key={p.id} onClick={() => setFilterProject(p.id)}
                  style={{ background: filterProject === p.id ? 'rgba(255,98,0,0.08)' : '#FFFFFF', border: `1px solid ${filterProject === p.id ? '#FF6200' : '#EBEBEB'}`, color: filterProject === p.id ? '#FF6200' : '#888888', fontSize: 11, padding: '5px 12px', borderRadius: 6, cursor: 'pointer' }}>
                  {p.name}
                </button>
              ))}
              <span style={{ color: '#E0E0E0' }}>|</span>
              {[{ key: 'all', label: '전체' }, { key: 'design', label: '디자인' }, { key: 'video', label: '영상' }, { key: 'document', label: '문서' }].map(c => (
                <button key={c.key} onClick={() => setFilterCategory(c.key)}
                  style={{ background: filterCategory === c.key ? 'rgba(255,98,0,0.08)' : '#FFFFFF', border: `1px solid ${filterCategory === c.key ? '#FF6200' : '#EBEBEB'}`, color: filterCategory === c.key ? '#FF6200' : '#888888', fontSize: 11, padding: '5px 12px', borderRadius: 6, cursor: 'pointer' }}>
                  {c.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <input type="file" ref={fileInputRef} multiple onChange={handleFileUpload} style={{ display: 'none' }} />
              <button onClick={() => fileInputRef.current?.click()}
                style={{
                  background: 'linear-gradient(135deg, #FF6200, #CC4E00)',
                  border: 'none', borderRadius: 8, color: '#fff',
                  fontSize: 12, padding: '8px 16px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600,
                }}>
                <Upload size={14} /> 파일 업로드
              </button>
            </div>
          </div>

          {/* Drop Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              e.preventDefault();
              const dt = e.dataTransfer;
              if (dt.files.length > 0) {
                const fakeEvent = { target: { files: dt.files } } as any;
                handleFileUpload(fakeEvent);
              }
            }}
            style={{
              border: '2px dashed #E0E0E0', borderRadius: 12, padding: '24px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              marginBottom: 20, cursor: 'pointer', color: '#AAAAAA', fontSize: 13,
              background: '#FAFAFA',
            }}>
            <Upload size={20} color="#CCCCCC" />
            파일을 드래그하거나 클릭해서 업로드
          </div>

          {/* File List */}
          <div style={{ background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
              padding: '10px 16px', borderBottom: '1px solid #F5F5F5',
            }}>
              {['파일명', '프로젝트', '카테고리', '크기', '업로드일'].map(h => (
                <p key={h} style={{ color: '#CCCCCC', fontSize: 11 }}>{h}</p>
              ))}
            </div>
            {filtered.map(f => {
              const project = projects.find(p => p.id === f.projectId);
              const uploader = users.find(u => u.id === f.uploadedBy);
              return (
                <div key={f.id} style={{
                  display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                  padding: '12px 16px', borderBottom: '1px solid #F9F9F9',
                  alignItems: 'center',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FileIcon type={f.type} />
                    <div>
                      <p style={{ color: '#111111', fontSize: 12 }}>{f.name}</p>
                      {f.tags && <div style={{ display: 'flex', gap: 4, marginTop: 3 }}>
                        {f.tags.map(t => (
                          <span key={t} style={{ background: '#F0F0F0', color: '#888888', fontSize: 9, padding: '1px 5px', borderRadius: 3 }}>{t}</span>
                        ))}
                      </div>}
                    </div>
                  </div>
                  <p style={{ color: '#AAAAAA', fontSize: 11 }}>{project?.name || '-'}</p>
                  <p style={{ color: '#AAAAAA', fontSize: 11 }}>
                    {{ design: '디자인', video: '영상', document: '문서', reference: '레퍼런스' }[f.category]}
                  </p>
                  <p style={{ color: '#AAAAAA', fontSize: 11 }}>{formatBytes(f.size)}</p>
                  <p style={{ color: '#AAAAAA', fontSize: 11 }}>{f.uploadedAt}</p>
                </div>
              );
            })}
          </div>
        </>
      )}

      {activeTab === 'reference' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
            <button style={{
              background: 'linear-gradient(135deg, #FF6200, #CC4E00)',
              border: 'none', borderRadius: 8, color: '#fff',
              fontSize: 12, padding: '8px 16px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600,
            }}>
              <Plus size={14} /> 레퍼런스 추가
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {REF_BOARD.map(ref => {
              const project = projects.find(p => p.id === ref.projectId);
              return (
                <div key={ref.id} style={{
                  background: '#FFFFFF', border: '1px solid #EBEBEB',
                  borderRadius: 14, overflow: 'hidden', cursor: 'pointer',
                  boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
                }}>
                  <div style={{
                    height: 120, background: `linear-gradient(135deg, ${ref.color}, ${ref.color}aa)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative',
                  }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 10,
                      background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Image size={20} color="rgba(255,255,255,0.6)" />
                    </div>
                  </div>
                  <div style={{ padding: '14px 16px' }}>
                    <h3 style={{ color: '#111111', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{ref.title}</h3>
                    <p style={{ color: '#AAAAAA', fontSize: 11, marginBottom: 10 }}>{ref.description}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {ref.tags.map(t => (
                          <span key={t} style={{ background: '#F0F0F0', color: '#888888', fontSize: 9, padding: '2px 6px', borderRadius: 3 }}>{t}</span>
                        ))}
                      </div>
                      <span style={{ color: '#AAAAAA', fontSize: 10 }}>{project?.name}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </AppShell>
  );
}
