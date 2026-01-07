import React, { useEffect, useMemo, useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonSegment,
  IonSegmentButton
} from '@ionic/react';
import { chevronBack, chevronForward } from 'ionicons/icons';
import './Tab2.css';
import { loadTasks } from '../utils/storage';
import { Task } from '../models/task';

function toDateKey(d: Date) {
  const Y = d.getFullYear();
  const M = String(d.getMonth() + 1).padStart(2, '0');
  const D = String(d.getDate()).padStart(2, '0');
  return `${Y}-${M}-${D}`;
}

function dateKeyFromISO(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso);
  return toDateKey(d);
}

function timeDiffString(ms: number) {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

const Tab2: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [viewMonth, setViewMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(() => toDateKey(new Date()));
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    (async () => {
      const t = await loadTasks();
      setTasks(t || []);
    })();
    const handler = (e: any) => {
      const list: Task[] = e?.detail ?? [];
      setTasks(list || []);
    };
    window.addEventListener('tasks:changed', handler as EventListener);
    return () => window.removeEventListener('tasks:changed', handler as EventListener);
  }, []);

  const tasksByDate = useMemo(() => {
    const m: Record<string, Task[]> = {};
    for (const t of tasks) {
      const k = dateKeyFromISO(t.due) || toDateKey(new Date(t.createdAt));
      if (!m[k]) m[k] = [];
      m[k].push(t);
    }
    return m;
  }, [tasks]);

  const monthMatrix = useMemo(() => {
    const first = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
    const startDay = first.getDay();
    const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
    const rows: (number | null)[][] = [];
    let cur = 1 - startDay;
    for (let r = 0; r < 6; r++) {
      const row: (number | null)[] = [];
      for (let c = 0; c < 7; c++) {
        if (cur < 1 || cur > daysInMonth) row.push(null);
        else row.push(cur);
        cur++;
      }
      rows.push(row);
    }
    return rows;
  }, [viewMonth]);

  function prevMonth() {
    setViewMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  }
  function nextMonth() {
    setViewMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1));
  }

  const upcoming = useMemo(() => {
    const now = Date.now();
    const limit = now + 48 * 60 * 60 * 1000; // 48h
    return tasks
      .filter(t => t.due && !t.completed && new Date(t.due).getTime() >= now && new Date(t.due).getTime() <= limit)
      .sort((a, b) => new Date(a.due!).getTime() - new Date(b.due!).getTime());
  }, [tasks]);

  const tasksForSelected = useMemo(() => {
    if (!selectedDate) return [];
    const list = tasksByDate[selectedDate] || [];
    if (filter === 'pending') return list.filter(t => !t.completed);
    if (filter === 'completed') return list.filter(t => t.completed);
    return list;
  }, [selectedDate, tasksByDate, filter]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Agenda</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="calendar-page">
        <div className="calendar-header">
          <div>
            <IonButton fill="clear" onClick={prevMonth}>
              <IonIcon icon={chevronBack} />
            </IonButton>
            <strong>{viewMonth.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</strong>
            <IonButton fill="clear" onClick={nextMonth}>
              <IonIcon icon={chevronForward} />
            </IonButton>
          </div>
          <IonSegment value={filter} onIonChange={e => setFilter((e.target as any).value)}>
            <IonSegmentButton value="all">Todas</IonSegmentButton>
            <IonSegmentButton value="pending">Pendientes</IonSegmentButton>
            <IonSegmentButton value="completed">Completadas</IonSegmentButton>
          </IonSegment>
        </div>

        <div className="calendar-grid">
          <div className="weekdays">
            {['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'].map(d => <div key={d} className="weekday">{d}</div>)}
          </div>
          {monthMatrix.map((row, ri) => (
            <div key={ri} className="week-row">
              {row.map((day, ci) => {
                const date = day ? new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day) : null;
                const key = date ? toDateKey(date) : null;
                const has = key ? (tasksByDate[key] ? tasksByDate[key].length > 0 : false) : false;
                return (
                  <div key={ci} className={`day-cell ${key === selectedDate ? 'selected' : ''} ${has ? 'has-tasks' : ''}`} onClick={() => key && setSelectedDate(key)}>
                    <div className="day-number">{day || ''}</div>
                    {has && <div className="dot" />}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div style={{ padding: 12 }}>
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Recordatorios próximos</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              {upcoming.length === 0 && <div>No hay recordatorios próximos.</div>}
              <IonList>
                {upcoming.map(t => {
                  const diff = new Date(t.due!).getTime() - Date.now();
                  return (
                    <IonItem key={t.id}>
                      <IonLabel>
                        <h3>{t.title}</h3>
                        <p>Vence en {timeDiffString(diff)}</p>
                      </IonLabel>
                      {t.priority && <IonBadge>{t.priority}</IonBadge>}
                    </IonItem>
                  );
                })}
              </IonList>
            </IonCardContent>
          </IonCard>

          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Tareas del día {selectedDate || ''}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList>
                {tasksForSelected.length === 0 && <div>Selecciona un día con tareas.</div>}
                {tasksForSelected.map(t => (
                  <IonItem key={t.id}>
                    <IonLabel>
                      <h3>{t.title}</h3>
                      <p>{t.notes}</p>
                      {t.due && <small>{new Date(t.due).toLocaleString()}</small>}
                    </IonLabel>
                    {t.priority && <IonBadge>{t.priority}</IonBadge>}
                  </IonItem>
                ))}
              </IonList>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
