'use client';

import { User, Project, Task, Production, Delivery, CalendarEvent, Notification } from './types';
import { format } from 'date-fns';

const today = format(new Date(), 'yyyy-MM-dd');

export const USERS: User[] = [
  { id: 'u1', name: '황준환', role: 'admin', email: 'admin@arium.kr' },
  { id: 'u2', name: '송예빈', role: 'designer', email: 'designer@arium.kr' },
  { id: 'u3', name: '송율', role: 'planner', email: 'planner@arium.kr' },
  { id: 'u4', name: '송초원', role: 'editor', email: 'editor@arium.kr' },
];

export const DEMO_CREDENTIALS: Record<string, string> = {
  'admin@arium.kr': 'arium2024',
  'designer@arium.kr': 'arium2024',
  'planner@arium.kr': 'arium2024',
  'editor@arium.kr': 'arium2024',
};

export const INITIAL_PROJECTS: Project[] = [];

const _unusedProjects: Project[] = [
  {
    id: 'p1',
    name: '나이키 SS25 캠페인',
    client: 'Nike Korea',
    description: '2025 봄/여름 시즌 브랜딩 캠페인 전체 기획 및 제작',
    status: 'active',
    startDate: '2025-03-01',
    endDate: '2025-05-31',
    progress: 65,
    members: ['u1', 'u2', 'u3', 'u4'],
    createdAt: '2025-03-01',
  },
  {
    id: 'p2',
    name: '아리움 브랜드 리뉴얼',
    client: '아리움 내부',
    description: '자사 브랜드 아이덴티티 전면 리뉴얼',
    status: 'active',
    startDate: '2025-04-01',
    endDate: '2025-06-30',
    progress: 30,
    members: ['u1', 'u2', 'u3'],
    createdAt: '2025-04-01',
  },
  {
    id: 'p3',
    name: '멀티플 컬렉션 론칭',
    client: 'Multiple Studio',
    description: '신규 라이프스타일 브랜드 론칭 패키지',
    status: 'planning',
    startDate: '2025-05-01',
    endDate: '2025-08-31',
    progress: 10,
    members: ['u1', 'u2', 'u4'],
    createdAt: '2025-04-20',
  },
];

export const INITIAL_TASKS: Task[] = [];
export const INITIAL_PRODUCTION: Production[] = [];
export const INITIAL_DELIVERY: Delivery[] = [];
export const INITIAL_EVENTS: CalendarEvent[] = [];
export const INITIAL_NOTIFICATIONS: Notification[] = [];

export function getUser(id: string): User | undefined {
  return USERS.find(u => u.id === id);
}

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    admin: '총괄책임자',
    designer: '디자이너',
    planner: '기획자',
    editor: '영상편집자',
  };
  return labels[role] || role;
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    todo: '할 일',
    inprogress: '진행 중',
    review: '검토 중',
    done: '완료',
    active: '진행 중',
    completed: '완료',
    paused: '일시정지',
    planning: '기획 중',
    contact: '컨택',
    sample: '샘플',
    production: '생산 중',
    qc: '품질검수',
    preparing: '준비 중',
    shipped: '출고',
    intransit: '배송 중',
    delivered: '배송 완료',
    low: '낮음',
    medium: '보통',
    high: '높음',
  };
  return labels[status] || status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    todo: '#555555',
    inprogress: '#FF6200',
    review: '#F59E0B',
    done: '#10B981',
    active: '#FF6200',
    completed: '#10B981',
    paused: '#555555',
    planning: '#6366F1',
    contact: '#6366F1',
    sample: '#F59E0B',
    production: '#FF6200',
    qc: '#3B82F6',
    preparing: '#F59E0B',
    shipped: '#3B82F6',
    intransit: '#FF6200',
    delivered: '#10B981',
    low: '#10B981',
    medium: '#F59E0B',
    high: '#EF4444',
  };
  return colors[status] || '#555555';
}
