'use client';

import { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useIsMobile } from '@/lib/hooks';
import { useApp } from '@/lib/context';
import { getStatusColor, getStatusLabel } from '@/lib/store';
import { Production, ProductionStatus } from '@/lib/types';
import { Plus, X } from 'lucide-react';

const STAGES: { key: ProductionStatus; label: string; desc: string }[] = [
  { key: 'contact', label: '컨택', desc: '업체 컨택 중' },
  { key: 'sample', label: '샘플', desc: '샘플 제작/검토' },
  { key: 'production', label: '생산 중', desc: '본 생산 진행' },
  { key: 'qc', label: '품질검수', desc: 'QC 진행 중' },
  { key: 'done', label: '완료', desc: '생산 완료' },
];

export default function ProductionPage() {
  const { productions, projects, addProduction, updateProduction } = useApp();
  const isMobile = useIsMobile();
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<Production | null>(null);
  const [form, setForm] = useState({ projectId: '', productName: '', vendor: '', quantity: '', status: 'contact' as ProductionStatus, sampleDate: '', productionDate: '', completionDate: '', notes: '' });

  const handleAdd = () => {
    if (!form.productName || !form.vendor || !form.projectId) return;
    addProduction({ ...form, quantity: Number(form.quantity) || 0 });
    setForm({ projectId: '', productName: '', vendor: '', quantity: '', status: 'contact', sampleDate: '', productionDate: '', completionDate: '', notes: '' });
    setShowAdd(false);
  };

  const inputStyle = { width: '100%', background: '#F7F7F7', border: '1px solid #EBEBEB', borderRadius: 8, padding: '9px 12px', color: '#111111', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const };

  return (
    <AppShell title="생산 관리">
      {/* Pipeline */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, overflowX: 'auto', background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: 14, boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
        {STAGES.map((s, i) => {
          const count = productions.filter(p => p.status === s.key).length;
          return (
            <div key={s.key} style={{ flex: 1, padding: '16px 20px', background: count > 0 ? `${getStatusColor(s.key)}06` : 'transparent', borderRight: i < STAGES.length - 1 ? '1px solid #EBEBEB' : 'none' }}>
              <p style={{ color: '#AAAAAA', fontSize: 10, marginBottom: 4 }}>{s.desc}</p>
              <p style={{ color: count > 0 ? getStatusColor(s.key) : '#DDDDDD', fontSize: 22, fontWeight: 800 }}>{count}</p>
              <p style={{ color: '#888888', fontSize: 12, fontWeight: 600 }}>{s.label}</p>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <button onClick={() => setShowAdd(true)} style={{ background: 'linear-gradient(135deg, #FF6200, #CC4E00)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, boxShadow: '0 2px 12px rgba(255,98,0,0.2)' }}>
          <Plus size={14} /> 생산 추가
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 14 }}>
        {productions.map(pr => {
          const project = projects.find(p => p.id === pr.projectId);
          const statusColor = getStatusColor(pr.status);
          const stageIndex = STAGES.findIndex(s => s.key === pr.status);
          return (
            <div key={pr.id} onClick={() => setSelected(pr)} style={{ background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: 14, padding: 20, cursor: 'pointer', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ background: `${statusColor}12`, color: statusColor, fontSize: 10, padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>{getStatusLabel(pr.status)}</span>
                <span style={{ color: '#AAAAAA', fontSize: 10 }}>{pr.quantity}개</span>
              </div>
              <h3 style={{ color: '#111111', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{pr.productName}</h3>
              <p style={{ color: '#FF6200', fontSize: 11, marginBottom: 4 }}>{pr.vendor}</p>
              {project && <p style={{ color: '#AAAAAA', fontSize: 11, marginBottom: 14 }}>{project.name}</p>}
              <div style={{ display: 'flex', gap: 3 }}>
                {STAGES.map((s, i) => (
                  <div key={s.key} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= stageIndex ? getStatusColor(pr.status) : '#F0F0F0' }} />
                ))}
              </div>
              {pr.notes && <p style={{ color: '#AAAAAA', fontSize: 11, marginTop: 10, lineHeight: 1.4 }}>{pr.notes}</p>}
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setSelected(null)}>
          <div style={{ background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: isMobile ? '20px 20px 0 0' : 18, padding: isMobile ? '20px 16px' : 28, width: isMobile ? '100%' : 480, maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.12)', ...(isMobile && { position: 'fixed', bottom: 0, left: 0, right: 0 }) }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ color: '#111111', fontSize: 16, fontWeight: 700 }}>{selected.productName}</h2>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#CCCCCC', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ marginBottom: 20 }}>
              <p style={{ color: '#AAAAAA', fontSize: 11, marginBottom: 10 }}>단계 변경</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {STAGES.map(s => (
                  <button key={s.key}
                    onClick={() => { updateProduction(selected.id, { status: s.key }); setSelected({ ...selected, status: s.key }); }}
                    style={{ background: selected.status === s.key ? `${getStatusColor(s.key)}12` : '#F7F7F7', border: `1px solid ${selected.status === s.key ? getStatusColor(s.key) : '#EBEBEB'}`, color: selected.status === s.key ? getStatusColor(s.key) : '#888888', fontSize: 11, padding: '5px 12px', borderRadius: 6, cursor: 'pointer' }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[{ label: '업체', value: selected.vendor }, { label: '수량', value: `${selected.quantity}개` }, { label: '샘플 일정', value: selected.sampleDate || '-' }, { label: '생산 시작', value: selected.productionDate || '-' }, { label: '완료 예정', value: selected.completionDate || '-' }].map(item => (
                <div key={item.label} style={{ background: '#F7F7F7', borderRadius: 8, padding: '10px 14px', border: '1px solid #F0F0F0' }}>
                  <p style={{ color: '#AAAAAA', fontSize: 10, marginBottom: 4 }}>{item.label}</p>
                  <p style={{ color: '#111111', fontSize: 13 }}>{item.value}</p>
                </div>
              ))}
            </div>
            {selected.notes && (
              <div style={{ marginTop: 10, background: '#F7F7F7', borderRadius: 8, padding: '10px 14px', border: '1px solid #F0F0F0' }}>
                <p style={{ color: '#AAAAAA', fontSize: 10, marginBottom: 4 }}>메모</p>
                <p style={{ color: '#444444', fontSize: 12, lineHeight: 1.5 }}>{selected.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setShowAdd(false)}>
          <div style={{ background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: isMobile ? '20px 20px 0 0' : 18, padding: isMobile ? '20px 16px' : 28, width: isMobile ? '100%' : 460, maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.12)', ...(isMobile && { position: 'fixed', bottom: 0, left: 0, right: 0 }) }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ color: '#111111', fontSize: 16, fontWeight: 700 }}>생산 추가</h2>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', color: '#CCCCCC', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            {[{ label: '제품명', key: 'productName', placeholder: '굿즈명, 제품명' }, { label: '업체명', key: 'vendor', placeholder: '생산 업체' }, { label: '수량', key: 'quantity', placeholder: '0', type: 'number' }].map(f => (
              <div key={f.key} style={{ marginBottom: 12 }}>
                <label style={{ color: '#AAAAAA', fontSize: 11, display: 'block', marginBottom: 6 }}>{f.label}</label>
                <input value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} type={f.type || 'text'} style={inputStyle} />
              </div>
            ))}
            <div style={{ marginBottom: 12 }}>
              <label style={{ color: '#AAAAAA', fontSize: 11, display: 'block', marginBottom: 6 }}>프로젝트</label>
              <select value={form.projectId} onChange={e => setForm(p => ({ ...p, projectId: e.target.value }))} style={inputStyle}>
                <option value="">프로젝트 선택</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              {[{ label: '샘플 일정', key: 'sampleDate' }, { label: '생산 시작', key: 'productionDate' }, { label: '완료 예정', key: 'completionDate' }].map(f => (
                <div key={f.key}>
                  <label style={{ color: '#AAAAAA', fontSize: 11, display: 'block', marginBottom: 6 }}>{f.label}</label>
                  <input type="date" value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} style={{ ...inputStyle, colorScheme: 'light' }} />
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ color: '#AAAAAA', fontSize: 11, display: 'block', marginBottom: 6 }}>메모</label>
              <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="특이사항, 요청사항" rows={3} style={{ ...inputStyle, resize: 'none' }} />
            </div>
            <button onClick={handleAdd} style={{ width: '100%', background: 'linear-gradient(135deg, #FF6200, #CC4E00)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, padding: '11px', cursor: 'pointer', fontWeight: 700, boxShadow: '0 4px 16px rgba(255,98,0,0.2)' }}>
              생산 등록
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
