'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User, Role, Project, Task, Production, Delivery, CalendarEvent, Notification, Comment, ChecklistItem
} from './types';
import {
  USERS, DEMO_CREDENTIALS,
  INITIAL_PROJECTS, INITIAL_TASKS, INITIAL_PRODUCTION,
  INITIAL_DELIVERY, INITIAL_EVENTS, INITIAL_NOTIFICATIONS
} from './store';
import { supabase } from './supabase';

interface AppState {
  currentUser: User | null;
  users: User[];
  projects: Project[];
  tasks: Task[];
  productions: Production[];
  deliveries: Delivery[];
  events: CalendarEvent[];
  notifications: Notification[];
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  addUser: (data: { name: string; role: Role; email: string; password: string }) => Promise<void>;
  updateUser: (id: string, updates: { name?: string; role?: Role; email?: string }) => Promise<void>;
  changePassword: (id: string, password: string) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'comments' | 'attachments'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  addComment: (taskId: string, text: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addAttachment: (taskId: string, file: File) => Promise<void>;
  addProduction: (prod: Omit<Production, 'id' | 'createdAt'>) => Promise<void>;
  updateProduction: (id: string, updates: Partial<Production>) => Promise<void>;
  addDelivery: (del: Omit<Delivery, 'id' | 'createdAt'>) => Promise<void>;
  updateDelivery: (id: string, updates: Partial<Delivery>) => Promise<void>;
  toggleChecklist: (deliveryId: string, checkId: string) => Promise<void>;
  addEvent: (event: Omit<CalendarEvent, 'id'>) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  unreadCount: number;
}

const AppContext = createContext<AppState | null>(null);

function uid() { return Math.random().toString(36).slice(2, 10); }
function now() { return new Date().toISOString(); }

// DB row (snake_case) → TypeScript 타입 (camelCase)
function mapProject(row: any): Project {
  return {
    id: row.id, name: row.name, client: row.client, description: row.description,
    status: row.status, startDate: row.start_date, endDate: row.end_date,
    progress: row.progress, members: row.members || [], createdAt: row.created_at,
  };
}

function mapTask(row: any): Task {
  const comments: Comment[] = (row.comments || []).map((c: any) => ({
    id: c.id, userId: c.user_id, text: c.text, createdAt: c.created_at,
  }));
  const attachments = (row.attachments || []).map((a: any) => ({
    id: a.id, name: a.name, url: a.url, type: a.type, size: a.size,
    uploadedBy: a.uploaded_by, uploadedAt: a.uploaded_at,
  }));
  return {
    id: row.id, projectId: row.project_id, title: row.title, description: row.description,
    status: row.status, priority: row.priority, assigneeId: row.assignee_id,
    dueDate: row.due_date, progress: row.progress, createdAt: row.created_at,
    comments, attachments,
  };
}

function mapProduction(row: any): Production {
  return {
    id: row.id, projectId: row.project_id, productName: row.product_name,
    vendor: row.vendor, quantity: row.quantity, status: row.status,
    sampleDate: row.sample_date, productionDate: row.production_date,
    completionDate: row.completion_date, notes: row.notes, createdAt: row.created_at,
  };
}

function mapDelivery(row: any): Delivery {
  const checklist: ChecklistItem[] = (row.checklist_items || []).map((c: any) => ({
    id: c.id, label: c.label, checked: c.checked,
  }));
  return {
    id: row.id, projectId: row.project_id, productionId: row.production_id,
    recipient: row.recipient, items: row.items, quantity: row.quantity,
    status: row.status, dueDate: row.due_date, trackingNumber: row.tracking_number,
    carrier: row.carrier, notes: row.notes, checklist, createdAt: row.created_at,
  };
}

function mapEvent(row: any): CalendarEvent {
  return {
    id: row.id, title: row.title, date: row.date, endDate: row.end_date,
    type: row.type, projectId: row.project_id, assigneeIds: row.assignee_ids || [], color: row.color,
  };
}

function mapNotification(row: any): Notification {
  return {
    id: row.id, userId: row.user_id, message: row.message, type: row.type,
    read: row.read, createdAt: row.created_at, link: row.link,
  };
}

const DATA_VERSION = 'v2';

function saveLocal(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}
function loadLocal<T>(key: string): T | null {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; }
}
function clearLocalData() {
  ['arium_projects', 'arium_tasks', 'arium_productions', 'arium_deliveries', 'arium_events', 'arium_notifications'].forEach(k => localStorage.removeItem(k));
  localStorage.setItem('arium_data_version', DATA_VERSION);
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [productions, setProductions] = useState<Production[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (localStorage.getItem('arium_data_version') !== DATA_VERSION) {
      clearLocalData();
    }
    const saved = localStorage.getItem('arium_user');
    if (saved) setCurrentUser(JSON.parse(saved));
    loadAll();
  }, []);

  useEffect(() => {
    if (loading) return;
    saveLocal('arium_projects', projects);
    saveLocal('arium_tasks', tasks);
    saveLocal('arium_productions', productions);
    saveLocal('arium_deliveries', deliveries);
    saveLocal('arium_events', events);
    saveLocal('arium_notifications', notifications);
  }, [projects, tasks, productions, deliveries, events, notifications, loading]);

  function loadFromLocalStorage() {
    setUsers(USERS);
    setProjects(loadLocal<Project[]>('arium_projects') ?? INITIAL_PROJECTS);
    setTasks(loadLocal<Task[]>('arium_tasks') ?? INITIAL_TASKS);
    setProductions(loadLocal<Production[]>('arium_productions') ?? INITIAL_PRODUCTION);
    setDeliveries(loadLocal<Delivery[]>('arium_deliveries') ?? INITIAL_DELIVERY);
    setEvents(loadLocal<CalendarEvent[]>('arium_events') ?? INITIAL_EVENTS);
    setNotifications(loadLocal<Notification[]>('arium_notifications') ?? INITIAL_NOTIFICATIONS);
  }

  async function loadAll() {
    setLoading(true);
    try {
      // 로컬스토리지에 데이터가 있으면 바로 사용 (Supabase 기다리지 않음)
      if (loadLocal('arium_projects') !== null) {
        loadFromLocalStorage();
        return;
      }
      // 로컬스토리지 없을 때만 Supabase 시도
      const [
        { data: uData },
        { data: pData, error: pError }, { data: tData }, { data: prData },
        { data: dData }, { data: eData }, { data: nData },
      ] = await Promise.all([
        supabase.from('users').select('id, name, role, email').order('name'),
        supabase.from('projects').select('*').order('created_at'),
        supabase.from('tasks').select('*, comments(*), attachments(*)').order('created_at'),
        supabase.from('productions').select('*').order('created_at'),
        supabase.from('deliveries').select('*, checklist_items(*)').order('created_at'),
        supabase.from('calendar_events').select('*').order('date'),
        supabase.from('notifications').select('*').order('created_at', { ascending: false }),
      ]);

      if (!pError && pData?.length) {
        if (uData?.length) setUsers(uData as User[]);
        setProjects(pData.map(mapProject));
        setTasks((tData || []).map(mapTask));
        setProductions((prData || []).map(mapProduction));
        setDeliveries((dData || []).map(mapDelivery));
        setEvents((eData || []).map(mapEvent));
        setNotifications((nData || []).map(mapNotification));
      } else {
        loadFromLocalStorage(); // 초기 데모 데이터 사용
      }
    } catch {
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  }

  async function seedInitialData() {
    await supabase.from('projects').insert(
      INITIAL_PROJECTS.map(p => ({
        id: p.id, name: p.name, client: p.client, description: p.description,
        status: p.status, start_date: p.startDate, end_date: p.endDate,
        progress: p.progress, members: p.members, created_at: p.createdAt,
      }))
    );

    await supabase.from('tasks').insert(
      INITIAL_TASKS.map(t => ({
        id: t.id, project_id: t.projectId, title: t.title, description: t.description,
        status: t.status, priority: t.priority, assignee_id: t.assigneeId,
        due_date: t.dueDate, progress: t.progress, created_at: t.createdAt,
      }))
    );

    await supabase.from('productions').insert(
      INITIAL_PRODUCTION.map(p => ({
        id: p.id, project_id: p.projectId, product_name: p.productName,
        vendor: p.vendor, quantity: p.quantity, status: p.status,
        sample_date: p.sampleDate, production_date: p.productionDate,
        completion_date: p.completionDate, notes: p.notes, created_at: p.createdAt,
      }))
    );

    for (const d of INITIAL_DELIVERY) {
      await supabase.from('deliveries').insert({
        id: d.id, project_id: d.projectId, production_id: d.productionId,
        recipient: d.recipient, items: d.items, quantity: d.quantity,
        status: d.status, due_date: d.dueDate, tracking_number: d.trackingNumber,
        carrier: d.carrier, notes: d.notes, created_at: d.createdAt,
      });
      if (d.checklist.length) {
        await supabase.from('checklist_items').insert(
          d.checklist.map(c => ({ id: c.id, delivery_id: d.id, label: c.label, checked: c.checked }))
        );
      }
    }

    await supabase.from('calendar_events').insert(
      INITIAL_EVENTS.map(e => ({
        id: e.id, title: e.title, date: e.date, end_date: e.endDate,
        type: e.type, project_id: e.projectId, assignee_ids: e.assigneeIds, color: e.color,
      }))
    );

    await supabase.from('notifications').insert(
      INITIAL_NOTIFICATIONS.map(n => ({
        id: n.id, user_id: n.userId, message: n.message, type: n.type,
        read: n.read, created_at: n.createdAt, link: n.link,
      }))
    );
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    // 데모 계정은 항상 먼저 체크
    if (DEMO_CREDENTIALS[email] === password) {
      const fallbackUser = USERS.find(u => u.email === email);
      if (fallbackUser) {
        setCurrentUser(fallbackUser);
        localStorage.setItem('arium_user', JSON.stringify(fallbackUser));
        return true;
      }
    }
    // Supabase 실계정 확인
    try {
      const { data } = await supabase
        .from('users')
        .select('id, name, role, email')
        .eq('email', email)
        .eq('password', password)
        .single();
      if (data) {
        setCurrentUser(data as User);
        localStorage.setItem('arium_user', JSON.stringify(data));
        return true;
      }
    } catch {
      // Supabase 연결 실패
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('arium_user');
  };

  const addUser = async (data: { name: string; role: Role; email: string; password: string }) => {
    const id = uid();
    const newUser: User = { id, name: data.name, role: data.role, email: data.email };
    setUsers(prev => [...prev, newUser]);
    await supabase.from('users').insert({ id, ...data });
  };

  const updateUser = async (id: string, updates: { name?: string; role?: Role; email?: string }) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    await supabase.from('users').update(updates).eq('id', id);
  };

  const changePassword = async (id: string, password: string) => {
    await supabase.from('users').update({ password }).eq('id', id);
  };

  const deleteUser = async (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    await supabase.from('users').delete().eq('id', id);
  };

  const addProject = async (p: Omit<Project, 'id' | 'createdAt'>) => {
    const id = uid(); const created_at = now();
    setProjects(prev => [...prev, { ...p, id, createdAt: created_at }]);
    await supabase.from('projects').insert({
      id, name: p.name, client: p.client, description: p.description,
      status: p.status, start_date: p.startDate, end_date: p.endDate,
      progress: p.progress, members: p.members, created_at,
    });
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    const db: any = {};
    if (updates.name !== undefined) db.name = updates.name;
    if (updates.client !== undefined) db.client = updates.client;
    if (updates.description !== undefined) db.description = updates.description;
    if (updates.status !== undefined) db.status = updates.status;
    if (updates.startDate !== undefined) db.start_date = updates.startDate;
    if (updates.endDate !== undefined) db.end_date = updates.endDate;
    if (updates.progress !== undefined) db.progress = updates.progress;
    if (updates.members !== undefined) db.members = updates.members;
    await supabase.from('projects').update(db).eq('id', id);
  };

  const deleteProject = async (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    setTasks(prev => prev.filter(t => t.projectId !== id));
    await supabase.from('tasks').delete().eq('project_id', id);
    await supabase.from('projects').delete().eq('id', id);
  };

  const addTask = async (t: Omit<Task, 'id' | 'createdAt' | 'comments' | 'attachments'>) => {
    const id = uid(); const created_at = now();
    setTasks(prev => [...prev, { ...t, id, createdAt: created_at, comments: [], attachments: [] }]);
    await supabase.from('tasks').insert({
      id, project_id: t.projectId, title: t.title, description: t.description,
      status: t.status, priority: t.priority, assignee_id: t.assigneeId,
      due_date: t.dueDate, progress: t.progress, created_at,
    });
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    const db: any = {};
    if (updates.title !== undefined) db.title = updates.title;
    if (updates.description !== undefined) db.description = updates.description;
    if (updates.status !== undefined) db.status = updates.status;
    if (updates.priority !== undefined) db.priority = updates.priority;
    if (updates.assigneeId !== undefined) db.assignee_id = updates.assigneeId;
    if (updates.dueDate !== undefined) db.due_date = updates.dueDate;
    if (updates.progress !== undefined) db.progress = updates.progress;
    await supabase.from('tasks').update(db).eq('id', id);
  };

  const deleteTask = async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    await supabase.from('comments').delete().eq('task_id', id);
    await supabase.from('tasks').delete().eq('id', id);
  };

  const addAttachment = async (taskId: string, file: File) => {
    if (!currentUser) return;
    const id = uid();
    let url = '';

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'arium-uploads');
      const res = await fetch('https://api.cloudinary.com/v1_1/dm1nzbn7k/auto/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) url = data.secure_url;
    } catch {}

    if (!url) {
      url = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    const attachment = {
      id, name: file.name, url,
      type: file.type, size: file.size,
      uploadedBy: currentUser.id, uploadedAt: now(),
    };
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, attachments: [...t.attachments, attachment] } : t));
  };

  const addComment = async (taskId: string, text: string) => {
    if (!currentUser) return;
    const id = uid(); const created_at = now();
    const comment: Comment = { id, userId: currentUser.id, text, createdAt: created_at };
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, comments: [...t.comments, comment] } : t));
    await supabase.from('comments').insert({ id, task_id: taskId, user_id: currentUser.id, text, created_at });
  };

  const addProduction = async (p: Omit<Production, 'id' | 'createdAt'>) => {
    const id = uid(); const created_at = now();
    setProductions(prev => [...prev, { ...p, id, createdAt: created_at }]);
    await supabase.from('productions').insert({
      id, project_id: p.projectId, product_name: p.productName, vendor: p.vendor,
      quantity: p.quantity, status: p.status, sample_date: p.sampleDate,
      production_date: p.productionDate, completion_date: p.completionDate,
      notes: p.notes, created_at,
    });
  };

  const updateProduction = async (id: string, updates: Partial<Production>) => {
    setProductions(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    const db: any = {};
    if (updates.productName !== undefined) db.product_name = updates.productName;
    if (updates.vendor !== undefined) db.vendor = updates.vendor;
    if (updates.quantity !== undefined) db.quantity = updates.quantity;
    if (updates.status !== undefined) db.status = updates.status;
    if (updates.sampleDate !== undefined) db.sample_date = updates.sampleDate;
    if (updates.productionDate !== undefined) db.production_date = updates.productionDate;
    if (updates.completionDate !== undefined) db.completion_date = updates.completionDate;
    if (updates.notes !== undefined) db.notes = updates.notes;
    await supabase.from('productions').update(db).eq('id', id);
  };

  const addDelivery = async (d: Omit<Delivery, 'id' | 'createdAt'>) => {
    const id = uid(); const created_at = now();
    setDeliveries(prev => [...prev, { ...d, id, createdAt: created_at }]);
    await supabase.from('deliveries').insert({
      id, project_id: d.projectId, production_id: d.productionId,
      recipient: d.recipient, items: d.items, quantity: d.quantity,
      status: d.status, due_date: d.dueDate, tracking_number: d.trackingNumber,
      carrier: d.carrier, notes: d.notes, created_at,
    });
    if (d.checklist.length) {
      await supabase.from('checklist_items').insert(
        d.checklist.map(c => ({ id: c.id, delivery_id: id, label: c.label, checked: c.checked }))
      );
    }
  };

  const updateDelivery = async (id: string, updates: Partial<Delivery>) => {
    setDeliveries(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
    const db: any = {};
    if (updates.recipient !== undefined) db.recipient = updates.recipient;
    if (updates.items !== undefined) db.items = updates.items;
    if (updates.quantity !== undefined) db.quantity = updates.quantity;
    if (updates.status !== undefined) db.status = updates.status;
    if (updates.dueDate !== undefined) db.due_date = updates.dueDate;
    if (updates.trackingNumber !== undefined) db.tracking_number = updates.trackingNumber;
    if (updates.carrier !== undefined) db.carrier = updates.carrier;
    if (updates.notes !== undefined) db.notes = updates.notes;
    await supabase.from('deliveries').update(db).eq('id', id);
  };

  const toggleChecklist = async (deliveryId: string, checkId: string) => {
    const delivery = deliveries.find(d => d.id === deliveryId);
    const item = delivery?.checklist.find(c => c.id === checkId);
    if (!item) return;
    const newChecked = !item.checked;
    setDeliveries(prev => prev.map(d =>
      d.id === deliveryId
        ? { ...d, checklist: d.checklist.map(c => c.id === checkId ? { ...c, checked: newChecked } : c) }
        : d
    ));
    await supabase.from('checklist_items').update({ checked: newChecked }).eq('id', checkId);
  };

  const addEvent = async (e: Omit<CalendarEvent, 'id'>) => {
    const id = uid();
    setEvents(prev => [...prev, { ...e, id }]);
    await supabase.from('calendar_events').insert({
      id, title: e.title, date: e.date, end_date: e.endDate,
      type: e.type, project_id: e.projectId, assignee_ids: e.assigneeIds, color: e.color,
    });
  };

  const markNotificationRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    await supabase.from('notifications').update({ read: true }).eq('id', id);
  };

  const unreadCount = notifications.filter(n => n.userId === currentUser?.id && !n.read).length;

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#F4F4F4',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 36, height: 36, border: '3px solid #FF6200',
            borderTopColor: 'transparent', borderRadius: '50%',
            animation: 'spin 0.7s linear infinite', margin: '0 auto 12px',
          }} />
          <p style={{ color: '#AAAAAA', fontSize: 13 }}>불러오는 중...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      currentUser, users, projects, tasks, productions, deliveries,
      events, notifications, loading, login, logout,
      addUser, updateUser, changePassword, deleteUser,
      addProject, updateProject, deleteProject, addTask, updateTask, deleteTask, addComment, addAttachment,
      addProduction, updateProduction, addDelivery, updateDelivery,
      toggleChecklist, addEvent, markNotificationRead, unreadCount,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
