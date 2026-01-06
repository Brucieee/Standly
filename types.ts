export enum UserRole {
  DEVELOPER = 'Developer',
  QA = 'Quality Assurance',
  PRODUCT_OWNER = 'Product Owner',
  PRODUCT_MANAGER = 'Product Manager'
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  isAdmin: boolean;
}

export interface Standup {
  id: string;
  userId: string;
  date: string; // ISO String
  yesterday: string;
  today: string;
  blockers: string;
  mood: 'happy' | 'neutral' | 'stressed';
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  assigneeId: string; // Could be self or others
  creatorId: string;
  dueDate: string; // ISO String
  type?: 'task' | 'deadline'; // New field for separation
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  standups: Standup[];
  tasks: Task[];
}