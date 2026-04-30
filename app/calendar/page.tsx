'use client';

import { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useIsMobile } from '@/lib/hooks';
import { useApp } from '@/lib/context';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, addMonths, subMonths } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';

const EVENT_COLORS: Record<string, string> = {
  meeting: '#6366F1', deadline: '#EF4444',
  delivery: '#FF6200', production: '#F59E0B', other: '#AAAAAA',
};
const EVENT_LABELS: Record<string, string> = {
  meeting: '미팅', deadline: '마감', delivery: '납품', production: '생산', other: '기타',
};

export default function CalendarPage() {
  const { events, projects, addEvent } = useApp();
  const isMobile = useIsMobile();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAdd, setShowAdd] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', date: '', type: 'meeting', projectId: '' });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = monthStart.getDay();
  const paddedDays = [...Array(startPad).fill(null), ...days];

  const getEventsForDay = (date: Date) => events.filter(e => isSameDay(parseISO(e.date), date));

  const handleAdd = () => {
    if (!form.title || !form.date) return;
    addEvent({ ...form, type: form.type as any, assigneeIds: [] });
    setForm({ title: '', date: '', type: 'meeting', projectId: '' });
    setShowAdd(false);
  };

  const selectedDayEvents = selectedDay ? events.filter(e => e.date === selectedDay) : [];

  const inputStyle = { width: '100%', background: '#F7F7F7', border: '1px solid #EBEBEB', borderRadius: 8, padding: '9px 12px', color: '#111111', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const };

  return (
    <AppShell title="팀 캘린더">
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? 10 : 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => setCurrentDate(d => subMonths(d, 1))} style={{ background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: '#888888' }}><ChevronLeft size={16} /></button>
            <h2 style={{ color: '#111111', fontSize: isMobile ? 15 : 18, fontWeight: 700, minWidth: isMobile ? 100 : 150, textAlign: 'center' }}>
              {format(currentDate, 'yyyy년 M월', { locale: ko })}
            </h2>
            <button onClick={() => setCurrentDate(d => addMonths(d, 1))} style={{ background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: '#888888' }}><ChevronRight size={16} /></button>
            <button onClick={() => setCurrentDate(new Date())} style={{ background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#888888', fontSize: 11 }}>오늘</button>
          </div>
          <button onClick={() => setShowAdd(true)} style={{ background: 'linear-gradient(135deg, #FF6200, #CC4E00)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, padding: '7px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600, boxShadow: '0 2px 12px rgba(255,98,0,0.2)' }}>
            <Plus size={13} /> {isMobile ? '' : '일정 추가'}
          </button>
        </div>
        {!isMobile && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
            {Object.entries(EVENT_COLORS).map(([type, color]) => (
              <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: color }} />
                <span style={{ color: '#AAAAAA', fontSize: 10 }}>{EVENT_LABELS[type]}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #F5F5F5' }}>
          {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
            <div key={d} style={{ padding: '10px 0', textAlign: 'center', color: i === 0 ? '#EF4444' : i === 6 ? '#6366F1' : '#AAAAAA', fontSize: 11, fontWeight: 600 }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {paddedDays.map((day, idx) => {
            if (!day) return <div key={`pad-${idx}`} style={{ borderRight: '1px solid #F5F5F5', borderBottom: '1px solid #F5F5F5', minHeight: isMobile ? 52 : 90 }} />;
            const dayEvents = getEventsForDay(day);
            const isToday = isSameDay(day, new Date());
            const dayStr = format(day, 'yyyy-MM-dd');
            const isSelected = dayStr === selectedDay;
            const isSun = day.getDay() === 0;
            const isSat = day.getDay() === 6;
            return (
              <div key={dayStr} onClick={() => setSelectedDay(isSelected ? null : dayStr)} style={{ borderRight: '1px solid #F5F5F5', borderBottom: '1px solid #F5F5F5', minHeight: isMobile ? 52 : 90, padding: isMobile ? '4px 3px' : '8px 6px', cursor: 'pointer', background: isSelected ? 'rgba(255,98,0,0.03)' : 'transparent' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', marginBottom: 4, background: isToday ? '#FF6200' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: isToday ? '#fff' : isSun ? '#EF4444' : isSat ? '#6366F1' : '#555555', fontSize: 11, fontWeight: isToday ? 700 : 400 }}>
                    {format(day, 'd')}
                  </span>
                </div>
                {dayEvents.slice(0, 2).map(e => (
                  <div key={e.id} style={{ background: `${EVENT_COLORS[e.type]}12`, borderLeft: `2px solid ${EVENT_COLORS[e.type]}`, padding: '2px 5px', borderRadius: 3, marginBottom: 2 }}>
                    <p style={{ color: EVENT_COLORS[e.type], fontSize: 9, fontWeight: 600, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{e.title}</p>
                  </div>
                ))}
                {dayEvents.length > 2 && <p style={{ color: '#AAAAAA', fontSize: 9 }}>+{dayEvents.length - 2}개</p>}
              </div>
            );
          })}
        </div>
      </div>

      {selectedDay && selectedDayEvents.length > 0 && (
        <div style={{ marginTop: 16, background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: 14, padding: 20, boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
          <h3 style={{ color: '#111111', fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
            {format(parseISO(selectedDay), 'M월 d일 EEEE', { locale: ko })} 일정
          </h3>
          {selectedDayEvents.map(e => {
            const project = projects.find(p => p.id === e.projectId);
            return (
              <div key={e.id} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid #F5F5F5' }}>
                <div style={{ width: 3, background: EVENT_COLORS[e.type], borderRadius: 2, flexShrink: 0 }} />
                <div>
                  <p style={{ color: '#111111', fontSize: 13, fontWeight: 500 }}>{e.title}</p>
                  {project && <p style={{ color: '#AAAAAA', fontSize: 11, marginTop: 2 }}>{project.name}</p>}
                </div>
                <span style={{ marginLeft: 'auto', background: `${EVENT_COLORS[e.type]}12`, color: EVENT_COLORS[e.type], fontSize: 10, padding: '3px 8px', borderRadius: 4, fontWeight: 600, height: 'fit-content' }}>
                  {EVENT_LABELS[e.type]}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setShowAdd(false)}>
          <div style={{ background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: isMobile ? '20px 20px 0 0' : 18, padding: isMobile ? '20px 16px' : 28, width: isMobile ? '100%' : 400, maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.12)', ...(isMobile && { position: 'fixed', bottom: 0, left: 0, right: 0 }) }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ color: '#111111', fontSize: 16, fontWeight: 700 }}>일정 추가</h2>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', color: '#CCCCCC', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ color: '#AAAAAA', fontSize: 11, display: 'block', marginBottom: 6 }}>일정 제목</label>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="일정 제목" style={inputStyle} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ color: '#AAAAAA', fontSize: 11, display: 'block', marginBottom: 6 }}>날짜</label>
                <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} style={{ ...inputStyle, colorScheme: 'light' }} />
              </div>
              <div>
                <label style={{ color: '#AAAAAA', fontSize: 11, display: 'block', marginBottom: 6 }}>유형</label>
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} style={inputStyle}>
                  {Object.entries(EVENT_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ color: '#AAAAAA', fontSize: 11, display: 'block', marginBottom: 6 }}>프로젝트</label>
              <select value={form.projectId} onChange={e => setForm(p => ({ ...p, projectId: e.target.value }))} style={inputStyle}>
                <option value="">프로젝트 선택 (선택사항)</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <button onClick={handleAdd} style={{ width: '100%', background: 'linear-gradient(135deg, #FF6200, #CC4E00)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, padding: '11px', cursor: 'pointer', fontWeight: 700, boxShadow: '0 4px 16px rgba(255,98,0,0.2)' }}>
              일정 추가
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
