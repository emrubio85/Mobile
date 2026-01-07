
import { Task } from '../models/task';

const TASKS_KEY = 'tasks_v1';

let hasCapacitorPreferences: boolean | null = null;
let PreferencesModule: any = null;

async function ensureCapacitor() {
  if (hasCapacitorPreferences !== null) return hasCapacitorPreferences;
  try {
    const mod = await import('@capacitor/preferences');
    PreferencesModule = mod.Preferences || mod;
    hasCapacitorPreferences = true;
  } catch (e) {
    hasCapacitorPreferences = false;
  }
  return hasCapacitorPreferences;
}

export async function loadTasks(): Promise<Task[]> {
  try {
    const cap = await ensureCapacitor();
    if (cap && PreferencesModule) {
      try {
        const res = await PreferencesModule.get({ key: TASKS_KEY });
        if (res && res.value) return JSON.parse(res.value) as Task[];
      } catch (e) {
        console.warn('Preferences.get failed, falling back to localStorage', e);
      }
    }

    const raw = localStorage.getItem(TASKS_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as Task[];
    } catch (e) {
      console.error('parse localStorage tasks failed', e);
      return [];
    }
  } catch (e) {
    console.error('loadTasks error', e);
    return [];
  }
}

export async function saveTasks(tasks: Task[]) {
  try {
    const cap = await ensureCapacitor();
    const value = JSON.stringify(tasks);

    try {
      localStorage.setItem(TASKS_KEY, value);
    } catch (e) {
      console.warn('localStorage.setItem failed', e);
    }

    if (cap && PreferencesModule) {
      try {
        await PreferencesModule.set({ key: TASKS_KEY, value });
      } catch (e) {
        console.warn('Preferences.set failed', e);
      }
    }
    // emit global event so UI can react
    try {
      if (typeof window !== 'undefined' && (window as any).dispatchEvent) {
        window.dispatchEvent(new CustomEvent('tasks:changed', { detail: tasks }));
      }
    } catch (e) {
      // ignore
    }
  } catch (e) {
    console.error('saveTasks error', e);
  }
}

export async function removeTask(id: string) {
  const tasks = await loadTasks();
  const filtered = tasks.filter(t => t.id !== id);
  await saveTasks(filtered);
  try {
    if (typeof window !== 'undefined' && (window as any).dispatchEvent) {
      window.dispatchEvent(new CustomEvent('tasks:changed', { detail: filtered }));
    }
  } catch (e) {
    // ignore
  }
}

