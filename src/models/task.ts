export interface Task {
  id: string;
  title: string;
  notes?: string;
  due?: string; // ISO string
  completed: boolean;
  priority?: 'low' | 'medium' | 'high';
  createdAt: string;
  completedAt?: string;
}
