export interface Task {
  id: string;
  title: string;
  notes?: string;
  due?: string; // ISO string
  completed: boolean;
  priority?: 'low' | 'medium' | 'high';
  category?: 'work' | 'personal' | 'study' | 'shopping' | 'others';
  attachments?: string[]; // Base64 strings
  createdAt: string;
  completedAt?: string;
}
