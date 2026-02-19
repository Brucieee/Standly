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
  avatarColor?: string;
  pet?: string;
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

export interface Deadline {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  status?: 'Pending' | 'In Progress' | 'Completed' | 'For QA' | 'Completed Beyond Schedule';
  priority?: 'Low' | 'Medium' | 'High';
  remarks?: string;
  creatorId: string;
  releaseLink?: string;
  assigneeIds?: string[] | null;
}

export interface Leave {
  id: string;
  userId: string;
  startDate: string; // ISO Date string (YYYY-MM-DD)
  endDate: string;   // ISO Date string (YYYY-MM-DD)
  reason?: string;
  type: 'vacation' | 'sick' | 'personal' | 'wellness' | 'birthday';
  startTime?: string;
  endTime?: string;
}

export interface Holiday {
    id: string;
    date: string;
    name: string;
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  standups: Standup[];
  deadlines: Deadline[];
  leaves: Leave[];
  holidays: Holiday[];
  quickLinks: QuickLink[];
  announcements: Announcement[];
}

export type QuickLinkCategory = 'General' | 'Development' | 'Design' | 'Resources' | 'Social' | 'Tools';

export interface QuickLink {
  id: string;
  title: string;
  url: string;
  iconUrl?: string;
  category: QuickLinkCategory;
  createdAt?: string;
  createdBy?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string; // HTML string
  imageUrl?: string;
  createdBy: string;
  createdAt: string;
  isActive: boolean;
  scheduledDate?: string; // ISO String: When to start showing
  expiryDate?: string; // ISO String: When to stop showing
  views?: string[]; // Array of user IDs who have seen it
}