'use client';

import { useState, useRef } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useIsMobile } from '@/lib/hooks';
import { useApp } from '@/lib/context';
import { Upload, ImageIcon, Film, FileText, File, X, Plus, Link, Trash2, ExternalLink } from 'lucide-react';

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

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function getDomain(url: string) {
  try { return new URL(url).hostname.replace('www.', ''); } catch { return url; }
}

function FileIcon({ type }: { type: string }) {
  if (type.startsWith('image')) return <ImageIcon size={20} color="#6366F1" />;
  if (type.startsWith('video')) return <Film size={20} color="#FF6200" />;
  if (type.includes('pdf') || type.includes('document')) return <FileText size={20} color="#F59E0B" />;
  return <File size={20} color="#555" />;
}

const CARD_COLORS = ['#FF6200', '#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#0EA5E9'];
function colorFromString(s: string) {
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = s.charCodeAt(i) + ((hash << 5) - hash);
  return CARD_COLORS[Math.abs(hash) % CARD_COLORS.length];
}

export default function FilesPage() {
  const { projects, currentUser, references, addReference, deleteReference } = useApp();
  const [files, setFiles] = useState<FileItem[]>(MOCK_FILES);
  const [filterProject, setFilterProject] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [activeTab, setActiveTab] = useState<'files' | 'reference'>('files');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  // 레퍼런스 상태
  const [refFilterProject, setRefFilterProject] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [refType, setRefType] = useState<'url' | 'image'>('url');
  const [form, setForm] = useState({ title: '', description: '', url: '', projectId: '', tagInput: '', tags: [] as string[] });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const imgInputRef = useRef<HTMLInputElement>(null);

  const filtered = files.filter(f => {
    if (filterProject !== 'all' && f.projectId !== filterProject) return false;
    if (filterCategory !== 'all' && f.category !== filterCategory) return false;
    return true;
  });

  const filteredRefs = references.filter(r =>
    refFilterProject === 'all' || r.projectId === refFilterProject
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(e.target.files || []);
    uploadedFiles.forEach(file => {
      const category: FileItem['category'] =
        file.type.startsWith('image') ? 'design' :
          file.type.startsWith('video') ? 'video' : 'document';
      setFiles(prev => [...prev, {
        id: Math.random().toString(36).slice(2),
        name: file.name, type: file.type, size: file.size,
        projectId: filterProject === 'all' ? '' : filterProject,
        category, uploadedBy: currentUser!.id,
        uploadedAt: new Date().toISOString().slice(0, 10),
        url: URL.createObjectURL(file), tags: [],
      }]);
    });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    if (!form.title) setForm(f => ({ ...f, title: file.name.replace(/\.[^.]+$/, '') }));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && form.tagInput.trim()) {
      e.preventDefault();
      const tag = form.tagInput.trim().replace(/,$/, '');
      if (tag && !form.tags.includes(tag)) {
        setForm(f => ({ ...f, tags: [...f.tags, tag], tagInput: '' }));
      } else {
        setForm(f => ({ ...f, tagInput: '' }));
      }
    }
  };

  const removeTag = (tag: string) => setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }));

  const resetModal = () => {
    setForm({ title: '', description: '', url: '', projectId: '', tagInput: '', tags: [] });
    setImageFile(null);
    setImagePreview('');
    setRefType('url');
    setShowModal(false);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    if (refType === 'url' && !form.url.trim()) return;
    if (refType === 'image' && !imageFile) return;
    setSubmitting(true);
    await addReference({
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      url: refType === 'url' ? form.url.trim() : undefined,
      imageFile: refType === 'image' ? imageFile! : undefined,
      tags: form.tags,
      projectId: form.projectId || undefined,
    });
    setSubmitting(false);
    resetModal();
  };

  const canDelete = (createdBy: string) =>
    currentUser?.role === 'admin' || currentUser?.id === createdBy;

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

      {/* ─── 파일 탭 ─── */}
      {activeTab === 'files' && (
        <>
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
                style={{ background: 'linear-gradient(135deg, #FF6200, #CC4E00)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                <Upload size={14} /> 파일 업로드
              </button>
            </div>
          </div>

          <div onClick={() => fileInputRef.current?.click()} onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); if (e.dataTransfer.files.length > 0) handleFileUpload({ target: { files: e.dataTransfer.files } } as any); }}
            style={{ border: '2px dashed #E0E0E0', borderRadius: 12, padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 20, cursor: 'pointer', color: '#AAAAAA', fontSize: 13, background: '#FAFAFA' }}>
            <Upload size={20} color="#CCCCCC" />
            파일을 드래그하거나 클릭해서 업로드
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
            {!isMobile && (
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '10px 16px', borderBottom: '1px solid #F5F5F5' }}>
                {['파일명', '프로젝트', '카테고리', '크기', '업로드일'].map(h => (
                  <p key={h} style={{ color: '#CCCCCC', fontSize: 11 }}>{h}</p>
                ))}
              </div>
            )}
            {filtered.length === 0 && (
              <p style={{ color: '#CCCCCC', fontSize: 12, textAlign: 'center', padding: '32px 0' }}>아직 파일이 없어요</p>
            )}
            {filtered.map(f => {
              const project = projects.find(p => p.id === f.projectId);
              return isMobile ? (
                <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid #F9F9F9' }}>
                  <FileIcon type={f.type} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: '#111111', fontSize: 13, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{f.name}</p>
                    <p style={{ color: '#AAAAAA', fontSize: 11 }}>{project?.name || '-'} · {formatBytes(f.size)}</p>
                  </div>
                </div>
              ) : (
                <div key={f.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '12px 16px', borderBottom: '1px solid #F9F9F9', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FileIcon type={f.type} />
                    <p style={{ color: '#111111', fontSize: 12 }}>{f.name}</p>
                  </div>
                  <p style={{ color: '#AAAAAA', fontSize: 11 }}>{project?.name || '-'}</p>
                  <p style={{ color: '#AAAAAA', fontSize: 11 }}>{{ design: '디자인', video: '영상', document: '문서', reference: '레퍼런스' }[f.category]}</p>
                  <p style={{ color: '#AAAAAA', fontSize: 11 }}>{formatBytes(f.size)}</p>
                  <p style={{ color: '#AAAAAA', fontSize: 11 }}>{f.uploadedAt}</p>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ─── 레퍼런스 보드 탭 ─── */}
      {activeTab === 'reference' && (
        <div>
          {/* 상단 필터 + 추가 버튼 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={() => setRefFilterProject('all')}
                style={{ background: refFilterProject === 'all' ? 'rgba(255,98,0,0.08)' : '#FFFFFF', border: `1px solid ${refFilterProject === 'all' ? '#FF6200' : '#EBEBEB'}`, color: refFilterProject === 'all' ? '#FF6200' : '#888888', fontSize: 11, padding: '5px 12px', borderRadius: 6, cursor: 'pointer' }}>
                전체
              </button>
              {projects.map(p => (
                <button key={p.id} onClick={() => setRefFilterProject(p.id)}
                  style={{ background: refFilterProject === p.id ? 'rgba(255,98,0,0.08)' : '#FFFFFF', border: `1px solid ${refFilterProject === p.id ? '#FF6200' : '#EBEBEB'}`, color: refFilterProject === p.id ? '#FF6200' : '#888888', fontSize: 11, padding: '5px 12px', borderRadius: 6, cursor: 'pointer' }}>
                  {p.name}
                </button>
              ))}
            </div>
            <button onClick={() => setShowModal(true)}
              style={{ background: 'linear-gradient(135deg, #FF6200, #CC4E00)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, flexShrink: 0 }}>
              <Plus size={14} /> 레퍼런스 추가
            </button>
          </div>

          {/* 빈 상태 */}
          {filteredRefs.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#CCCCCC' }}>
              <ImageIcon size={40} color="#E0E0E0" style={{ margin: '0 auto 12px' }} />
              <p style={{ fontSize: 13 }}>레퍼런스를 추가해보세요</p>
              <p style={{ fontSize: 11, marginTop: 4 }}>URL 링크나 이미지를 저장해두면 팀원 모두가 볼 수 있어요</p>
            </div>
          )}

          {/* 카드 그리드 */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: 16 }}>
            {filteredRefs.map(ref => {
              const project = projects.find(p => p.id === ref.projectId);
              const color = colorFromString(ref.title);
              return (
                <div key={ref.id} style={{ background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,0.04)', position: 'relative' }}>
                  {/* 썸네일 */}
                  {ref.imageUrl ? (
                    <img src={ref.imageUrl} alt={ref.title} style={{ width: '100%', height: 130, objectFit: 'cover', display: 'block' }} />
                  ) : (
                    <div style={{ height: 130, background: `linear-gradient(135deg, ${color}22, ${color}44)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <Link size={22} color={color} />
                      {ref.url && <p style={{ color: color, fontSize: 10, fontWeight: 600, opacity: 0.8 }}>{getDomain(ref.url)}</p>}
                    </div>
                  )}

                  {/* 외부 링크 버튼 */}
                  {ref.url && (
                    <a href={ref.url} target="_blank" rel="noopener noreferrer"
                      style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.4)', borderRadius: 6, padding: '4px 6px', display: 'flex', alignItems: 'center', gap: 3, color: '#fff', fontSize: 10, textDecoration: 'none', backdropFilter: 'blur(4px)' }}>
                      <ExternalLink size={10} /> 열기
                    </a>
                  )}

                  {/* 삭제 버튼 */}
                  {canDelete(ref.createdBy) && (
                    <button onClick={() => deleteReference(ref.id)}
                      style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: 6, padding: '4px 6px', cursor: 'pointer', display: 'flex', alignItems: 'center', backdropFilter: 'blur(4px)' }}>
                      <Trash2 size={12} color="#fff" />
                    </button>
                  )}

                  {/* 카드 내용 */}
                  <div style={{ padding: '12px 14px 14px' }}>
                    <h3 style={{ color: '#111111', fontSize: 13, fontWeight: 600, marginBottom: 3, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{ref.title}</h3>
                    {ref.description && (
                      <p style={{ color: '#888888', fontSize: 11, marginBottom: 8, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>{ref.description}</p>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 8, marginTop: ref.description ? 0 : 4 }}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', flex: 1 }}>
                        {ref.tags.map(t => (
                          <span key={t} style={{ background: '#F0F0F0', color: '#888888', fontSize: 9, padding: '2px 6px', borderRadius: 3 }}>{t}</span>
                        ))}
                      </div>
                      {project && <span style={{ color: '#CCCCCC', fontSize: 10, flexShrink: 0 }}>{project.name}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── 레퍼런스 추가 모달 ─── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) resetModal(); }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', padding: 24 }}>
            {/* 모달 헤더 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>레퍼런스 추가</h2>
              <button onClick={resetModal} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><X size={18} color="#888" /></button>
            </div>

            {/* URL / 이미지 토글 */}
            <div style={{ display: 'flex', gap: 4, background: '#F0F0F0', padding: 4, borderRadius: 8, marginBottom: 18, width: 'fit-content' }}>
              {([{ key: 'url', label: 'URL 링크' }, { key: 'image', label: '이미지 업로드' }] as const).map(t => (
                <button key={t.key} onClick={() => setRefType(t.key)}
                  style={{ background: refType === t.key ? '#FF6200' : 'transparent', border: 'none', borderRadius: 5, color: refType === t.key ? '#fff' : '#888', fontSize: 12, padding: '5px 14px', cursor: 'pointer', fontWeight: 600 }}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* URL 입력 */}
            {refType === 'url' && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 5 }}>URL *</label>
                <input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                  placeholder="https://..."
                  style={{ width: '100%', border: '1px solid #E0E0E0', borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            )}

            {/* 이미지 업로드 */}
            {refType === 'image' && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 5 }}>이미지 *</label>
                <input type="file" accept="image/*" ref={imgInputRef} onChange={handleImageSelect} style={{ display: 'none' }} />
                {imagePreview ? (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img src={imagePreview} alt="preview" style={{ width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 8 }} />
                    <button onClick={() => { setImageFile(null); setImagePreview(''); }}
                      style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: 5, padding: '3px 5px', cursor: 'pointer', display: 'flex' }}>
                      <X size={12} color="#fff" />
                    </button>
                  </div>
                ) : (
                  <div onClick={() => imgInputRef.current?.click()}
                    style={{ border: '2px dashed #E0E0E0', borderRadius: 8, padding: '24px', textAlign: 'center', cursor: 'pointer', color: '#AAAAAA', fontSize: 12 }}>
                    <Upload size={20} color="#CCCCCC" style={{ margin: '0 auto 6px', display: 'block' }} />
                    클릭해서 이미지 선택
                  </div>
                )}
              </div>
            )}

            {/* 제목 */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 5 }}>제목 *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="레퍼런스 제목"
                style={{ width: '100%', border: '1px solid #E0E0E0', borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
            </div>

            {/* 설명 */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 5 }}>설명 (선택)</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="간단한 메모..."
                rows={2}
                style={{ width: '100%', border: '1px solid #E0E0E0', borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
            </div>

            {/* 태그 */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 5 }}>태그 (Enter 또는 , 로 추가)</label>
              <div style={{ border: '1px solid #E0E0E0', borderRadius: 8, padding: '6px 10px', display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', minHeight: 38 }}>
                {form.tags.map(tag => (
                  <span key={tag} style={{ background: '#FF620015', color: '#FF6200', fontSize: 11, padding: '2px 8px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    {tag}
                    <button onClick={() => removeTag(tag)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#FF6200' }}><X size={10} /></button>
                  </span>
                ))}
                <input value={form.tagInput}
                  onChange={e => setForm(f => ({ ...f, tagInput: e.target.value }))}
                  onKeyDown={handleTagKeyDown}
                  placeholder={form.tags.length === 0 ? '예: 미니멀, 오렌지, 로고' : ''}
                  style={{ border: 'none', outline: 'none', fontSize: 12, flex: 1, minWidth: 80 }} />
              </div>
            </div>

            {/* 프로젝트 연결 */}
            <div style={{ marginBottom: 22 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 5 }}>프로젝트 연결 (선택)</label>
              <select value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))}
                style={{ width: '100%', border: '1px solid #E0E0E0', borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none', background: '#fff', boxSizing: 'border-box' }}>
                <option value="">연결 안 함</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            {/* 버튼 */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={resetModal}
                style={{ flex: 1, border: '1px solid #E0E0E0', borderRadius: 8, background: '#fff', color: '#888', fontSize: 13, padding: '10px 0', cursor: 'pointer', fontWeight: 600 }}>
                취소
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                style={{ flex: 2, background: 'linear-gradient(135deg, #FF6200, #CC4E00)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, padding: '10px 0', cursor: 'pointer', fontWeight: 600, opacity: submitting ? 0.6 : 1 }}>
                {submitting ? '저장 중...' : '추가'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
