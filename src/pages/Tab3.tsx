import React, { useEffect, useState, useMemo } from 'react';
import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar, 
  IonList, 
  IonItem, 
  IonLabel, 
  IonAvatar,
  IonToggle,
  IonIcon,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle
} from '@ionic/react';
import { 
  moonOutline, 
  notificationsOutline,
  lockClosedOutline,
  pieChartOutline
} from 'ionicons/icons';
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
  const [darkMode, setDarkMode] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    (async () => {
      const t = await loadTasks();
      setTasks(t || []);
    })();
    const handler = (e: any) => {
      setTasks(e?.detail ?? []);
    };
    window.addEventListener('tasks:changed', handler as EventListener);
    return () => window.removeEventListener('tasks:changed', handler as EventListener);
  }, []);

  // Stats Logic
  const completed = tasks.filter(t => t.completed);
  const total = tasks.length;
  const percent = total ? Math.round((completed.length / total) * 100) : 0;
  
  // Donut chart calc
  const d = donutPath(40, 6, percent);
  const strokeDashoffset = d.c - d.dash;

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': 'var(--ion-background-color)' }}>
          <IonTitle style={{ fontWeight: 800 }}>Perfil y Datos</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="profile-page apple-bg">
        
        {/* Profile Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px' }}>
          <div style={{ position: 'relative' }}>
             <IonAvatar style={{ width: '80px', height: '80px', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
               <img alt="Avatar" src="https://ionicframework.com/docs/img/demos/avatar.svg" />
             </IonAvatar>
          </div>
          <h2 style={{ marginTop: '12px', fontWeight: '700', fontSize: '20px' }}>Valencia Usuario</h2>
          <p style={{ margin: '4px', color: 'var(--ion-color-medium)', fontSize: '14px' }}>Gestor de Tareas</p>
        </div>

        {/* Stats Card */}
        <div style={{ padding: '0 16px 16px 16px' }}>
          <IonCard className="glass-effect" style={{ margin: 0, borderRadius: '20px' }}>
            <IonCardHeader style={{ paddingBottom: '0' }}>
              <IonCardTitle style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IonIcon icon={pieChartOutline} /> Productividad
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', paddingtop: '16px' }}>
               {/* SVG Donut */}
               <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                  <svg width="100" height="100" viewBox={`0 0 ${ (d.cx+d.r)*2 } ${ (d.cy+d.r)*2 }`} style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx={d.cx} cy={d.cy} r={d.r} strokeWidth={8} stroke="rgba(0,0,0,0.1)" fill="none" />
                    <circle
                      cx={d.cx}
                      cy={d.cy}
                      r={d.r}
                      strokeWidth={8}
                      stroke="url(#gradient)"
                      fill="none"
                      strokeDasharray={d.c}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#003366" />
                        <stop offset="100%" stopColor="#00509e" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '18px' }}>
                    {percent}%
                  </div>
               </div>
               
               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                 <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: '700' }}>{completed.length}</div>
                    <div style={{ fontSize: '12px', color: 'var(--ion-color-medium)' }}>Completadas</div>
                 </div>
                 <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: '700' }}>{total}</div>
                    <div style={{ fontSize: '12px', color: 'var(--ion-color-medium)' }}>Totales</div>
                 </div>
               </div>
            </IonCardContent>
          </IonCard>
        </div>

        {/* Settings List */}
        <IonList inset={true} style={{ borderRadius: '16px', marginBottom: '24px' }}>
          <IonItem lines="full" detail={false}>
            <IonIcon slot="start" icon={moonOutline} style={{ color: '#5856d6' }} />
            <IonLabel>Modo Oscuro</IonLabel>
            <IonToggle 
              checked={darkMode} 
              onIonChange={e => {
                setDarkMode(e.detail.checked);
                document.body.classList.toggle('dark', e.detail.checked);
              }} 
            />
          </IonItem>
          <IonItem lines="none" detail={false}>
            <IonIcon slot="start" icon={notificationsOutline} style={{ color: '#ff2d55' }} />
            <IonLabel>Notificaciones</IonLabel>
            <IonToggle defaultChecked={true} />
          </IonItem>
        </IonList>

        <IonList inset={true} style={{ borderRadius: '16px' }}>
          <IonItem button detail={true} lines="none">
            <IonIcon slot="start" icon={lockClosedOutline} style={{ color: '#34c759' }} />
            <IonLabel>Privacidad</IonLabel>
          </IonItem>
        </IonList>

      </IonContent>
    </IonPage>
  );
};

export default Tab3;
