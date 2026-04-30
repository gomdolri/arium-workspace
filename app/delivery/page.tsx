'use client';

import { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useIsMobile } from '@/lib/hooks';
import { useApp } from '@/lib/context';
import { getStatusColor, getStatusLabel } from '@/lib/store';
import { Delivery, DeliveryStatus } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { Plus, X, CheckSquare, Square } from 'lucide-react';

const STATUS_FLOW: DeliveryStatus[] = ['preparing', 'shipped', 'intransit', 'delivered'];

export default function DeliveryPage() {
  const { deliveries, projects, addDelivery, updateDelivery, toggleChecklist } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<Delivery | null>(null);
  const [form, setForm] = useState({ projectId: '', productionId: '', recipient: '', items: '', quantity: '', status: 'preparing' as DeliveryStatus, dueDate: '', trackingNumber: '', carrier: '', notes: '' });

  const handleAdd = () => {
    if (!form.recipient || !form.items || !form.dueDate) return;
    addDelivery({ ...form, quantity: Number(form.quantity) || 0, checklist: [{ id: 'c1', label: '수량 확인', checked: false }, { id: 'c2', label: '품질 검수', checked: false }, { id: 'c3', label: '포장 완료', checked: false }, { id: 'c4', label: '송장 발급', checked: false }, { id: 'c5', label: '배송 완료', checked: false }] });
    setForm({ projectId: '', productionId: '', recipient: '', items: '', quantity: '', status: 'preparing', dueDate: '', trackingNumber: '', carrier: '', notes: '' });
    setShowAdd(false);
  };

  const currentDelivery = selected ? deliveries.find(d => d.id === selected.id) || selected : null;
  const isMobile = useIsMobile();
  const inputStyle = { width: '100%', background: '#F7F7F7', border: '1px solid #EBEBEB', borderRadius: 8, padding: '9px 12px', color: '#111111', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const };

  return (
    <AppShell title="납품 관리">
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {STATUS_FLOW.map(s => {
          const count = deliveries.filter(d => d.status === s).length;
          const color = getStatusColor(s);
          return (
            <div key={s} style={{ background: '#FFFFFF', border: `1px solid ${count > 0 ? color + '25' : '#EBEBEB'}`, borderRadius: 14, padding: '16px 20px', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
              <p style={{ color: '#AAAAAA', fontSize: 10, marginBottom: 4 }}>{getStatusLabel(s)}</p>
              <p style={{ color: count > 0 ? color : '#DDDDDD', fontSize: 26, fontWeight: 800 }}>{count}</p>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <button onClick={() => setShowAdd(true)} style={{ background: 'linear-gradient(135deg, #FF6200, #CC4E00)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, boxShadow: '0 2px 12px rgba(255,98,0,0.2)' }}>
          <Plus size={14} /> 납품 추가
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {deliveries.map(d => {
          const project = projects.find(p => p.id === d.projectId);
          const checkedCount = d.checklist.filter(c => c.checked).length;
          const checkProgress = Math.round((checkedCount / d.checklist.length) * 100);
          const statusColor = getStatusColor(d.status);
          const stageIndex = STATUS_FLOW.indexOf(d.status);
          return (
            <div key={d.id} onClick={() => setSelected(d)} style={{ background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: 14, padding: '18px 22px', cursor: 'pointer', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <h3 style={{ color: '#111111', fontSize: 14, fontWeight: 600 }}>{d.items}</h3>
                  <p style={{ color: '#AAAAAA', fontSize: 11, marginTop: 2 }}>{d.recipient} · {d.quantity}개 · {project?.name}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ background: `${statusColor}12`, color: statusColor, fontSize: 10, padding: '3px 10px', borderRadius: 20, fontWeight: 600, display: 'inline-block', marginBottom: 4 }}>{getStatusLabel(d.status)}</span>
                  <p style={{ color: '#AAAAAA', fontSize: 10 }}>마감: {format(parseISO(d.dueDate), 'M월 d일')}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                {STATUS_FLOW.map((s, i) => <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= stageIndex ? getStatusColor(d.status) : '#F0F0F0' }} />)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1, background: '#F0F0F0', borderRadius: 4, height: 4 }}>
                  <div style={{ background: 'linear-gradient(90deg, #FF6200, #FF7A1A)', width: `${checkProgress}%`, height: '100%', borderRadius: 4 }} />
                </div>
                <span style={{ color: '#AAAAAA', fontSize: 10 }}>체크리스트 {checkedCount}/{d.checklist.length}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {selected && currentDelivery && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setSelected(null)}>
          <div style={{ background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: isMobile ? '20px 20px 0 0' : 18, padding: isMobile ? '20px 16px' : 28, width: isMobile ? '100%' : 480, maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.12)', ...(isMobile && { position: 'fixed', bottom: 0, left: 0, right: 0 }) }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ color: '#111111', fontSize: 16, fontWeight: 700 }}>{currentDelivery.items}</h2>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#CCCCCC', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ marginBottom: 20 }}>
              <p style={{ color: '#AAAAAA', fontSize: 11, marginBottom: 10 }}>배송 상태 변경</p>
              <div style={{ display: 'flex', gap: 6 }}>
                {STATUS_FLOW.map(s => (
                  <button key={s} onClick={() => updateDelivery(currentDelivery.id, { status: s })} style={{ background: currentDelivery.status === s ? `${getStatusColor(s)}12` : '#F7F7F7', border: `1px solid ${currentDelivery.status === s ? getStatusColor(s) : '#EBEBEB'}`, color: currentDelivery.status === s ? getStatusColor(s) : '#888888', fontSize: 11, padding: '5px 10px', borderRadius: 6, cursor: 'pointer' }}>
                    {getStatusLabel(s)}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ background: '#F7F7F7', borderRadius: 10, padding: '14px 16px', marginBottom: 20, border: '1px solid #F0F0F0' }}>
              <p style={{ color: '#AAAAAA', fontSize: 11, marginBottom: 10 }}>운송 정보</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[{ label: '수취인', value: currentDelivery.recipient }, { label: '수량', value: `${currentDelivery.quantity}개` }, { label: '배송사', value: currentDelivery.carrier || '-' }, { label: '운송장', value: currentDelivery.trackingNumber || '-' }, { label: '마감일', value: format(parseISO(currentDelivery.dueDate), 'yyyy.MM.dd') }].map(item => (
                  <div key={item.label}>
                    <p style={{ color: '#AAAAAA', fontSize: 10 }}>{item.label}</p>
                    <p style={{ color: '#111111', fontSize: 12 }}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p style={{ color: '#AAAAAA', fontSize: 11, marginBottom: 10 }}>납품 체크리스트</p>
              {currentDelivery.checklist.map(item => (
                <div key={item.id} onClick={() => toggleChecklist(currentDelivery.id, item.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: item.checked ? 'rgba(16,185,129,0.05)' : '#F7F7F7', borderRadius: 8, marginBottom: 6, cursor: 'pointer', border: `1px solid ${item.checked ? '#10B98120' : '#EBEBEB'}` }}>
                  {item.checked ? <CheckSquare size={16} color="#10B981" /> : <Square size={16} color="#CCCCCC" />}
                  <span style={{ color: item.checked ? '#10B981' : '#555555', fontSize: 13 }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setShowAdd(false)}>
          <div style={{ background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: isMobile ? '20px 20px 0 0' : 18, padding: isMobile ? '20px 16px' : 28, width: isMobile ? '100%' : 460, maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.12)', ...(isMobile && { position: 'fixed', bottom: 0, left: 0, right: 0 }) }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ color: '#111111', fontSize: 16, fontWeight: 700 }}>납품 추가</h2>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', color: '#CCCCCC', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            {[{ label: '납품 품목', key: 'items', placeholder: '예: 에코백 500개' }, { label: '수취인 / 납품처', key: 'recipient', placeholder: '회사명 또는 담당자' }, { label: '수량', key: 'quantity', placeholder: '0', type: 'number' }, { label: '배송사', key: 'carrier', placeholder: 'CJ대한통운, 한진 등' }, { label: '운송장 번호', key: 'trackingNumber', placeholder: '운송장 번호' }].map(f => (
              <div key={f.key} style={{ marginBottom: 12 }}>
                <label style={{ color: '#AAAAAA', fontSize: 11, display: 'block', marginBottom: 6 }}>{f.label}</label>
                <input value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} type={f.type || 'text'} style={inputStyle} />
              </div>
            ))}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ color: '#AAAAAA', fontSize: 11, display: 'block', marginBottom: 6 }}>프로젝트</label>
                <select value={form.projectId} onChange={e => setForm(p => ({ ...p, projectId: e.target.value }))} style={inputStyle}>
                  <option value="">선택</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ color: '#AAAAAA', fontSize: 11, display: 'block', marginBottom: 6 }}>납품 마감일</label>
                <input type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} style={{ ...inputStyle, colorScheme: 'light' }} />
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ color: '#AAAAAA', fontSize: 11, display: 'block', marginBottom: 6 }}>메모</label>
              <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="배송 주소, 특이사항" rows={2} style={{ ...inputStyle, resize: 'none' }} />
            </div>
            <button onClick={handleAdd} style={{ width: '100%', background: 'linear-gradient(135deg, #FF6200, #CC4E00)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, padding: '11px', cursor: 'pointer', fontWeight: 700, boxShadow: '0 4px 16px rgba(255,98,0,0.2)' }}>
              납품 등록
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
