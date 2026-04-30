'use client';

import { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useApp } from '@/lib/context';
import { useIsMobile } from '@/lib/hooks';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, addMonths, subMonths } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, X, Trash2 } from 'lucide-react';

const EVENT_COLORS: Record<string, string> = {
  meeting: '#6366F1', deadline: '#EF4444',
  delivery: '#FF6200', production: '#F59E0B', other: '#AAAAAA',
};
const EVENT_LABELS: Record<string, string> = {
  meeting: '미팅', deadline: '마감', delivery: '납품', production: '생산', other: '기타',
};

export default function CalendarPage() {
  const { events, projects, users, addEvent, deleteEvent } = useApp();
  const isMobile = useIsMobile();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAdd, setShowAdd] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', date: '', type: 'meeting', projectId: '', description: '', assigneeIds: [] as string[] });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = monthStart.getDay();
  const paddedDays = [...Array(startPad).fill(null), ...days];

  const getEventsForDay = (date: Date) => events.filter(e => isSameDay(parseISO(e.date), date));

  const handleAdd = () => {
    if (!form.title || !form.date) return;
    addEvent({ ...form, type: form.type as any });
    setForm({ title: '', date: '', type: 'meeting', projectId: '', description: '', assigneeIds: [] });
    setShowAdd(false);
  };

  const toggleAssignee = (userId: string) => {
    setForm(prev => ({
      ...prev,
      assigneeIds: prev.assigneeIds.includes(userId)
        ? prev.assigneeIds.filter(id => id !== userId)
        : [...prev.assigneeIds, userId],
    }));
  };

  const selectedDayEvents = selectedDay ? events.filter(e => e.date === selectedDay) : [];

  const inputStyle = { width: '100%', background: '#F7F7F7', border: '1px solid #EBEBEB', borderRadius: 8, padding: '9px 12px', color: '#111111', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const };

  return (
    <AppShell title="팀 캘린더">
      {/* 헤더 */}
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

      {/* 달력 */}
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
              <div key={dayStr} onClick={() => setSelectedDay(isSelected ? null : dayStr)}
                style={{ borderRight: '1px solid #F5F5F5', borderBottom: '1px solid #F5F5F5', minHeight: isMobile ? 52 : 90, padding: isMobile ? '4px 3px' : '8px 6px', cursor: 'pointer', background: isSelected ? 'rgba(255,98,0,0.03)' : 'transparent' }}>
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

      {/* 선택된 날 일정 목록 */}
      {selectedDay && selectedDayEvents.length > 0 && (
        <div style={{ marginTop: 16, background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: 14, padding: 20, boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
          <h3 style={{ color: '#111111', fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
            {format(parseISO(selectedDay), 'M월 d일 EEEE', { locale: ko })} 일정
          </h3>
          {selectedDayEvents.map(e => {
            const project = projects.find(p => p.id === e.projectId);
            const attendees = users.filter(u => e.assigneeIds.includes(u.id));
            return (
              <div key={e.id} style={{ padding: '14px 0', borderBottom: '1px solid #F5F5F5' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 3, background: EVENT_COLORS[e.type], borderRadius: 2, flexShrink: 0, alignSelf: 'stretch', minHeight: 20 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <p style={{ color: '#111111', fontSize: 13, fontWeight: 600 }}>{e.title}</p>
                        <span style={{ background: `${EVENT_COLORS[e.type]}12`, color: EVENT_COLORS[e.type], fontSize: 10, padding: '2px 8px', borderRadius: 4, fontWeight: 600, display: 'inline-block', marginTop: 4 }}>
                          {EVENT_LABELS[e.type]}
                        </span>
                        {project && <span style={{ color: '#AAAAAA', fontSize: 11, marginLeft: 6 }}>{project.name}</span>}
                      </div>
                      <button onClick={() => deleteEvent(e.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DDDDDD', padding: 4, flexShrink: 0 }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                    {e.description && (
                      <p style={{ color: '#666666', fontSize: 12, marginTop: 8, lineHeight: 1.5 }}>{e.description}</p>
                    )}
                    {attendees.length > 0 && (
                      <div style={{ display: 'flex', gap: 6, marginTop: 10, alignItems: 'center' }}>
                        <span style={{ color: '#AAAAAA', fontSize: 11 }}>참석:</span>
                        {attendees.map(u => (
                          <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#F5F5F5', borderRadius: 20, padding: '2px 8px 2px 4px' }}>
                            <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'linear-gradient(135deg, #FF6200, #CC4E00)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#fff', fontWeight: 700 }}>
                              {u.name[0]}
                            </div>
                            <span style={{ color: '#555555', fontSize: 11 }}>{u.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 일정 추가 모달 */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setShowAdd(false)}>
          <div style={{ background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: isMobile ? '20px 20px 0 0' : 18, padding: isMobile ? '20px 16px' : 28, width: isMobile ? '100%' : 420, maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ color: '#111111', fontSize: 16, fontWeight: 700 }}>일정 추가</h2>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', color: '#CCCCCC', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ color: '#AAAAAA', fontSize: 11, display: 'block', marginBottom: 6 }}>일정 제목</label>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="일정 제목" style={inputStyle} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ color: '#AAAAAA', fontSize: 11, display: 'block', marginBottom: 6 }}>상세 내용</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="장소, 준비물, 내용 등" rows={3} style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }} />
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

            <div style={{ marginBottom: 14 }}>
              <label style={{ color: '#AAAAAA', fontSize: 11, display: 'block', marginBottom: 6 }}>프로젝트</label>
              <select value={form.projectId} onChange={e => setForm(p => ({ ...p, projectId: e.target.value }))} style={inputStyle}>
                <option value="">프로젝트 선택 (선택사항)</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ color: '#AAAAAA', fontSize: 11, display: 'block', marginBottom: 8 }}>참석 팀원</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {users.map(u => {
                  const selected = form.assigneeIds.includes(u.id);
                  return (
                    <button key={u.id} onClick={() => toggleAssignee(u.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 20, border: `1px solid ${selected ? '#FF6200' : '#EBEBEB'}`, background: selected ? 'rgba(255,98,0,0.08)' : '#F7F7F7', cursor: 'pointer' }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: selected ? 'linear-gradient(135deg, #FF6200, #CC4E00)' : '#DDDDDD', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff', fontWeight: 700 }}>
                        {u.name[0]}
                      </div>
                      <span style={{ color: selected ? '#FF6200' : '#888888', fontSize: 12, fontWeight: selected ? 600 : 400 }}>{u.name}</span>
                    </button>
                  );
                })}
              </div>
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
