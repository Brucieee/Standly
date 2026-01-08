export enum UserRole {
  DEVELOPER = 'Software Developer',
  QA = 'Quality Assurance',
  PRODUCT_OWNER = 'Product Owner',
  PRODUCT_MANAGER = 'Product Manager',
  INTERN = 'Intern'
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  isAdmin: boolean;
  loginCode?: string;
}

export interface Comment {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
  replies?: Comment[];
  parentId?: string;
}

export interface Reaction {
  id: string;
  userId: string;
  type: string;
}

export interface Standup {
  id: string;
  userId: string;
  date: string; // ISO String
  yesterday: string;
  today: string;
  blockers: string;
  mood: 'happy' | 'neutral' | 'stressed';
  jiraLinks?: string[];
  views?: string[];
  comments?: Comment[];
  reactions?: Reaction[];
  createdAt?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  assigneeId: string; // Could be self or others
  creatorId: string;
  dueDate: string; // ISO String
}

export interface Deadline {
  id: string;
  title: string;
  dueDate: string;
  description?: string;
  releaseLink?: string;
  creatorId: string;
}

export interface Leave {
  id: string;
  userId: string;
  startDate: string; // ISO Date string (YYYY-MM-DD)
  endDate: string;   // ISO Date string (YYYY-MM-DD)
  reason?: string;
  type: 'vacation' | 'sick' | 'personal' | 'wellness';
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  standups: Standup[];
  deadlines: Deadline[];
  leaves: Leave[];
}