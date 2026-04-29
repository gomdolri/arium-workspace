'use client';

import { User, Project, Task, Production, Delivery, CalendarEvent, Notification } from './types';
import { format } from 'date-fns';

const today = format(new Date(), 'yyyy-MM-dd');

export const USERS: User[] = [
  { id: 'u1', name: '김관리', role: 'admin', email: 'admin@arium.kr' },
  { id: 'u2', name: '이디자', role: 'designer', email: 'designer@arium.kr' },
  { id: 'u3', name: '박기획', role: 'planner', email: 'planner@arium.kr' },
  { id: 'u4', name: '최편집', role: 'editor', email: 'editor@arium.kr' },
];

export const DEMO_CREDENTIALS: Record<string, string> = {
  'admin@arium.kr': 'arium2024',
  'designer@arium.kr': 'arium2024',
  'planner@arium.kr': 'arium2024',
  'editor@arium.kr': 'arium2024',
};

export const INITIAL_PROJECTS: Project[] = [
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

export const INITIAL_TASKS: Task[] = [
  {
    id: 't1',
    projectId: 'p1',
    title: '메인 비주얼 디자인',
    description: '캠페인 키 비주얼 3종 제작',
    status: 'inprogress',
    priority: 'high',
    assigneeId: 'u2',
    dueDate: '2025-05-10',
    createdAt: '2025-03-10',
    comments: [],
    attachments: [],
    progress: 70,
  },
  {
    id: 't2',
    projectId: 'p1',
    title: '브랜드 스토리 기획',
    description: 'SS25 시즌 브랜드 스토리 텍스트 및 방향 기획',
    status: 'review',
    priority: 'high',
    assigneeId: 'u3',
    dueDate: '2025-05-05',
    createdAt: '2025-03-10',
    comments: [],
    attachments: [],
    progress: 90,
  },
  {
    id: 't3',
    projectId: 'p1',
    title: '캠페인 영상 편집',
    description: '30초, 60초 버전 각각 제작',
    status: 'todo',
    priority: 'medium',
    assigneeId: 'u4',
    dueDate: '2025-05-20',
    createdAt: '2025-03-15',
    comments: [],
    attachments: [],
    progress: 0,
  },
  {
    id: 't4',
    projectId: 'p2',
    title: '로고 리디자인',
    description: '아리움 새 로고 3안 제작',
    status: 'inprogress',
    priority: 'high',
    assigneeId: 'u2',
    dueDate: '2025-05-15',
    createdAt: '2025-04-05',
    comments: [],
    attachments: [],
    progress: 40,
  },
  {
    id: 't5',
    projectId: 'p2',
    title: '브랜드 가이드라인 문서',
    description: '컬러, 타이포, 레이아웃 가이드 작성',
    status: 'todo',
    priority: 'medium',
    assigneeId: 'u3',
    dueDate: '2025-06-01',
    createdAt: '2025-04-05',
    comments: [],
    attachments: [],
    progress: 0,
  },
];

export const INITIAL_PRODUCTION: Production[] = [
  {
    id: 'pr1',
    projectId: 'p1',
    productName: '캠페인 굿즈 - 에코백',
    vendor: '서울텍스타일',
    quantity: 500,
    status: 'production',
    sampleDate: '2025-04-10',
    productionDate: '2025-04-20',
    completionDate: '2025-05-15',
    notes: '오렌지 컬러 패턴 적용, 캔버스 소재',
    createdAt: '2025-04-01',
  },
  {
    id: 'pr2',
    projectId: 'p1',
    productName: '패키지 박스',
    vendor: '한국포장산업',
    quantity: 500,
    status: 'sample',
    sampleDate: '2025-04-25',
    notes: '크래프트지 + 블랙 포일 인쇄',
    createdAt: '2025-04-15',
  },
];

export const INITIAL_DELIVERY: Delivery[] = [
  {
    id: 'd1',
    projectId: 'p1',
    productionId: 'pr1',
    recipient: 'Nike Korea 마케팅팀',
    items: '에코백 500개',
    quantity: 500,
    status: 'preparing',
    dueDate: '2025-05-20',
    notes: '강남구 테헤란로 152 나이키코리아 사옥',
    checklist: [
      { id: 'c1', label: '수량 확인', checked: true },
      { id: 'c2', label: '품질 검수', checked: true },
      { id: 'c3', label: '포장 완료', checked: false },
      { id: 'c4', label: '송장 발급', checked: false },
      { id: 'c5', label: '배송 완료', checked: false },
    ],
    createdAt: '2025-04-20',
  },
];

export const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: 'e1',
    title: '나이키 중간 보고',
    date: '2025-05-07',
    type: 'meeting',
    projectId: 'p1',
    assigneeIds: ['u1', 'u3'],
  },
  {
    id: 'e2',
    title: '메인 비주얼 마감',
    date: '2025-05-10',
    type: 'deadline',
    projectId: 'p1',
    assigneeIds: ['u2'],
  },
  {
    id: 'e3',
    title: '에코백 납품',
    date: '2025-05-20',
    type: 'delivery',
    projectId: 'p1',
    assigneeIds: ['u1'],
  },
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    userId: 'u2',
    message: '메인 비주얼 디자인 검토 요청이 왔습니다',
    type: 'approval',
    read: false,
    createdAt: today,
  },
  {
    id: 'n2',
    userId: 'u3',
    message: '브랜드 스토리 기획 댓글이 달렸습니다',
    type: 'comment',
    read: false,
    createdAt: today,
  },
];

export function getUser(id: string): User | undefined {
  return USERS.find(u => u.id === id);
}

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    admin: '관리자',
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
