export type Role = 'admin' | 'designer' | 'planner' | 'editor';

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
  avatar?: string;
}

export type TaskStatus = 'todo' | 'inprogress' | 'review' | 'done';
export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  assigneeId: string;
  dueDate?: string;
  createdAt: string;
  comments: Comment[];
  attachments: Attachment[];
  progress: number;
}

export interface Comment {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
}

export type ProjectStatus = 'active' | 'completed' | 'paused' | 'planning';

export interface Project {
  id: string;
  name: string;
  client: string;
  description?: string;
  status: ProjectStatus;
  startDate: string;
  endDate?: string;
  progress: number;
  members: string[];
  moodboard?: string[];
  references?: string[];
  createdAt: string;
}

export type ProductionStatus = 'contact' | 'sample' | 'production' | 'qc' | 'done';

export interface Production {
  id: string;
  projectId: string;
  productName: string;
  vendor: string;
  quantity: number;
  status: ProductionStatus;
  sampleDate?: string;
  productionDate?: string;
  completionDate?: string;
  notes?: string;
  createdAt: string;
}

export type DeliveryStatus = 'preparing' | 'shipped' | 'intransit' | 'delivered';

export interface Delivery {
  id: string;
  projectId: string;
  productionId?: string;
  recipient: string;
  items: string;
  quantity: number;
  status: DeliveryStatus;
  dueDate: string;
  trackingNumber?: string;
  carrier?: string;
  notes?: string;
  checklist: ChecklistItem[];
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  type: 'meeting' | 'deadline' | 'delivery' | 'production' | 'other';
  projectId?: string;
  assigneeIds: string[];
  description?: string;
  color?: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'task' | 'comment' | 'approval' | 'delivery' | 'production';
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface Reference {
  id: string;
  title: string;
  description?: string;
  url?: string;
  imageUrl?: string;
  tags: string[];
  projectId?: string;
  createdBy: string;
  createdAt: string;
}

export interface StoryboardScene {
  id: string;
  projectId: string;
  sceneOrder: number;
  title?: string;
  location?: string;
  characters?: string;
  description?: string;
  dialogue?: string;
  cameraAngle?: string;
  mood?: string;
  props?: string;
  duration?: string;
  notes?: string;
  createdAt: string;
}
