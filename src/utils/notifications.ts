import { Task } from '../models/task';

let timeouts: Record<string, number> = {};
let hasCapacitorLocal: boolean | null = null;
let LocalNotificationsModule: any = null;

function idFromString(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

async function ensureCapacitor() {
  if (hasCapacitorLocal !== null) return hasCapacitorLocal;
  try {
    // dynamic import in case the plugin isn't installed
    const mod = await import('@capacitor/local-notifications');
    LocalNotificationsModule = mod.LocalNotifications || mod;
    hasCapacitorLocal = true;
  } catch (e) {
    hasCapacitorLocal = false;
  }
  return hasCapacitorLocal;
}

export async function requestPermission(): Promise<boolean> {
  const cap = await ensureCapacitor();
  if (cap && LocalNotificationsModule) {
    try {
      const res = await LocalNotificationsModule.requestPermissions();
      return res.display === 'granted' || res.display === 'granted';
    } catch (e) {
      return false;
    }
  }

  if ('Notification' in window) {
    const p = await Notification.requestPermission();
    return p === 'granted';
  }
  return false;
}

export async function scheduleForTask(task: Task) {
  if (!task.due) return;
  if (task.completed) return;
  const when = new Date(task.due).getTime() - 2 * 60 * 60 * 1000; // 2 hours before
  const now = Date.now();
  const scheduleAt = when > now ? when : now + 5 * 1000; // if already within window, notify soon

  const cap = await ensureCapacitor();

  const notifId = idFromString(task.id);

  if (cap && LocalNotificationsModule) {
    try {
      await LocalNotificationsModule.schedule({
        notifications: [
          {
            id: notifId,
            title: `Tarea: ${task.title}`,
            body: task.notes || 'Tienes una tarea próxima a vencer',
            schedule: { at: new Date(scheduleAt) },
            smallIcon: 'ic_notification'
          }
        ]
      });
      return;
    } catch (e) {
      // fallthrough to web fallback
    }
  }

  // Web fallback: only works while app is open
  if ('Notification' in window && Notification.permission === 'granted') {
    const timeout = window.setTimeout(() => {
      try {
        new Notification(`Tarea: ${task.title}`, { body: task.notes || 'Tienes una tarea próxima a vencer' });
      } catch (e) {
        /* ignore */
      }
    }, Math.max(0, scheduleAt - Date.now()));
    timeouts[task.id] = timeout as unknown as number;
  }
}

export async function cancelForTask(taskId: string) {
  const cap = await ensureCapacitor();
  const notifId = idFromString(taskId);
  if (cap && LocalNotificationsModule) {
    try {
      await LocalNotificationsModule.cancel({ notifications: [{ id: notifId }] });
      return;
    } catch (e) {
      // ignore
    }
  }

  // web fallback
  const t = timeouts[taskId];
  if (t) {
    clearTimeout(t);
    delete timeouts[taskId];
  }
}

export async function rescheduleAll(tasks: Task[]) {
  const cap = await ensureCapacitor();
  if (cap && LocalNotificationsModule) {
    try {
      // naive: cancel all then schedule each
      await LocalNotificationsModule.cancelAll();
    } catch (e) {
      // ignore
    }
  } else {
    // clear web timeouts
    Object.values(timeouts).forEach(t => clearTimeout(t));
    timeouts = {};
  }

  for (const t of tasks) {
    await scheduleForTask(t);
  }
}
