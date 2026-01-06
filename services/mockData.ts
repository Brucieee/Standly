import { User, UserRole, Standup, Task } from '../types';

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Alex Rivera',
    email: 'alex@standly.app',
    avatar: 'https://picsum.photos/200/200?random=1',
    role: UserRole.DEVELOPER,
    isAdmin: true,
  },
  {
    id: 'u2',
    name: 'Sarah Chen',
    email: 'sarah@standly.app',
    avatar: 'https://picsum.photos/200/200?random=2',
    role: UserRole.PRODUCT_OWNER,
    isAdmin: false,
  },
  {
    id: 'u3',
    name: 'Mike Johnson',
    email: 'mike@standly.app',
    avatar: 'https://picsum.photos/200/200?random=3',
    role: UserRole.QA,
    isAdmin: false,
  },
  {
    id: 'u4',
    name: 'Emily Davis',
    email: 'emily@standly.app',
    avatar: 'https://picsum.photos/200/200?random=4',
    role: UserRole.PRODUCT_MANAGER,
    isAdmin: false,
  },
];

export const MOCK_STANDUPS: Standup[] = [
  {
    id: 's1',
    userId: 'u2',
    date: new Date(Date.now() - 86400000).toISOString(),
    yesterday: 'Reviewed the PRD for the new dashboard.',
    today: 'Meeting with stakeholders to finalize Q3 goals.',
    blockers: 'None.',
    mood: 'happy',
  },
  {
    id: 's2',
    userId: 'u1',
    date: new Date().toISOString(),
    yesterday: 'Implemented the auth flow mockups.',
    today: 'Connecting the frontend to the task service.',
    blockers: 'Waiting for API specs on user roles.',
    mood: 'neutral',
  },
];

export const MOCK_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Design System Update',
    description: 'Update color palette in Tailwind config',
    status: 'in-progress',
    assigneeId: 'u1',
    creatorId: 'u2',
    dueDate: new Date(Date.now() + 172800000).toISOString(),
  },
  {
    id: 't2',
    title: 'QA Smoke Test',
    description: 'Run regression suite on staging',
    status: 'todo',
    assigneeId: 'u3',
    creatorId: 'u4',
    dueDate: new Date(Date.now() + 86400000).toISOString(),
  },
];