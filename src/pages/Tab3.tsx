import React, { useEffect, useMemo, useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonProgressBar
} from '@ionic/react';
import './Tab3.css';
import { loadTasks } from '../utils/storage';
import { Task } from '../models/task';

function donutPath(radius: number, stroke: number, percent: number) {
  const cx = radius + stroke;
  const cy = cx;
  const r = radius;
  const c = 2 * Math.PI * r;
  const dash = (percent / 100) * c;
  return { cx, cy, r, c, dash };
}

const Tab3: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

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

  const completed = tasks.filter(t => t.completed);
  const total = tasks.length;
  const percent = total ? Math.round((completed.length / total) * 100) : 0;

  const completedThisWeek = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return completed.filter(t => t.completedAt && new Date(t.completedAt).getTime() >= weekAgo).length;
  }, [completed]);

  const history = completed
    .slice()
    .sort((a, b) => {
      const da = a.completedAt ? new Date(a.completedAt).getTime() : 0;
      const db = b.completedAt ? new Date(b.completedAt).getTime() : 0;
      return db - da;
    });

  const d = donutPath(40, 6, percent);

  const strokeDashoffset = d.c - d.dash;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Estadísticas</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="tab3-page">
        <div style={{ padding: 12 }}>
          <div className="stats-row">
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Progreso</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div className="donut-wrap">
                  <svg width={(d.cx + d.r) * 2} height={(d.cy + d.r) * 2}>
                    <defs>
                      <linearGradient id="donutGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#34c759" />
                        <stop offset="50%" stopColor="#ff9500" />
                        <stop offset="100%" stopColor="#ff3b30" />
                      </linearGradient>
                    </defs>
                    <circle cx={d.cx} cy={d.cy} r={d.r} strokeWidth={6} stroke="#eee" fill="none" />
                    <circle
                      className="donut-arc"
                      cx={d.cx}
                      cy={d.cy}
                      r={d.r}
                      strokeWidth={6}
                      stroke="url(#donutGrad)"
                      fill="none"
                      strokeDasharray={`${d.c}`}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      transform={`rotate(-90 ${d.cx} ${d.cy})`}
                    />
                    <text x={d.cx} y={d.cy} textAnchor="middle" dominantBaseline="central" fontSize={14}>{`${percent}%`}</text>
                  </svg>
                </div>
                <div style={{ marginTop: 8 }}>
                  <IonProgressBar value={percent / 100} />
                </div>
              </IonCardContent>
            </IonCard>

            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Métricas</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div>Has completado <strong>{completedThisWeek}</strong> tareas esta semana.</div>
                <div style={{ marginTop: 8 }}>Total completadas: <strong>{completed.length}</strong></div>
                <div style={{ marginTop: 8 }}>Total tareas: <strong>{total}</strong></div>
                <div style={{ marginTop: 12 }} className="priority-legend">
                  <div className="legend-item"><span className="legend-dot high"/> Alta</div>
                  <div className="legend-item"><span className="legend-dot medium"/> Media</div>
                  <div className="legend-item"><span className="legend-dot low"/> Baja</div>
                </div>
              </IonCardContent>
            </IonCard>
          </div>

          <IonCard style={{ marginTop: 12 }}>
            <IonCardHeader>
              <IonCardTitle>Historial de tareas completadas</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList>
                {history.length === 0 && <div>No hay tareas completadas aún.</div>}
                {history.map(t => (
                  <IonItem key={t.id}>
                    <IonLabel>
                      <h3>{t.title}</h3>
                      <p>{t.notes}</p>
                      <small>{t.completedAt ? new Date(t.completedAt).toLocaleString() : '—'}</small>
                    </IonLabel>
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

export default Tab3;
