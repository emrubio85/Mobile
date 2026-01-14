import React from 'react';
import {
  IonList,
  IonItem,
  IonLabel,
  IonCheckbox,
  IonButton,
  IonIcon,
  IonItemSliding,
  IonItemOptions,
  IonItemOption
} from '@ionic/react';
import { trash, createOutline, checkmarkDone, trashOutline, checkmarkCircleOutline, timerOutline } from 'ionicons/icons';
import { Task } from '../models/task';

interface Props {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onFocus: (task: Task) => void;
}

const TaskList: React.FC<Props> = ({ tasks, onToggle, onDelete, onEdit, onFocus }) => {
  if (tasks.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', opacity: 0.6 }}>
        <p>No hay tareas pendientes</p>
      </div>
    );
  }

  const slidingRef = (node: any) => {
    // Optional: could use this to close items programmatically
  };

  return (
    <IonList inset={true} style={{ borderRadius: '16px', background: 'transparent' }}>
      {tasks.map(t => (
        <IonItemSliding key={t.id} style={{ marginBottom: '8px', borderRadius: '12px', overflow: 'hidden' }}>
          
          {/* Options: Left Side (Complete & Focus) */}
          <IonItemOptions side="start">
            <IonItemOption color="success" onClick={() => onToggle(t.id)}>
              <IonIcon slot="icon-only" icon={t.completed ? checkmarkCircleOutline : checkmarkDone} />
            </IonItemOption>
            <IonItemOption color="primary" onClick={() => onFocus(t)}>
              <IonIcon slot="icon-only" icon={timerOutline} />
            </IonItemOption>
          </IonItemOptions>

          <IonItem 
            button 
            detail={false} 
            lines="none" 
            style={{ 
              '--background': 'white',
              '--padding-start': '16px',
              '--inner-padding-end': '16px'
            }}
            onClick={() => onEdit(t)}
          >
            <IonCheckbox 
              slot="start" 
              checked={t.completed} 
              onIonChange={e => {
                e.stopPropagation(); // prevent item click
                onToggle(t.id);
              }}
              style={{ marginRight: '16px', '--size': '22px' }}
            />
            <IonLabel style={{ opacity: t.completed ? 0.5 : 1, transition: 'opacity 0.3s' }}>
              <h3 style={{ 
                textDecoration: t.completed ? 'line-through' : 'none', 
                fontSize: '16px', 
                fontWeight: '600',
                color: 'var(--ion-text-color)' 
              }}>
                {t.title}
              </h3>
              <p style={{ margin: 0, fontSize: '12px' }}>
                {t.priority && t.priority !== 'medium' && (
                  <strong style={{ 
                    color: t.priority === 'high' ? 'var(--ion-color-danger)' : 'var(--ion-color-success)',
                    marginRight: '6px'
                  }}>
                    {t.priority === 'high' ? '!!!' : '!'}
                  </strong>
                )}
                {t.category && (
                  <span style={{ 
                    fontSize: '10px', 
                    padding: '3px 8px', 
                    borderRadius: '10px', 
                    background: 'rgba(0,0,0,0.05)', 
                    color: 'var(--ion-color-medium)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {t.category === 'work' ? 'Trabajo' : 
                     t.category === 'personal' ? 'Personal' : 
                     t.category === 'study' ? 'Estudios' : 
                     t.category === 'shopping' ? 'Compras' : 'Otro'}
                  </span>
                )}
                {t.due && (
                  <span style={{ marginLeft: '8px', color: 'var(--ion-color-medium)' }}>
                     ⏰ {new Date(t.due).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
                {t.attachments && t.attachments.length > 0 && (
                  <span style={{ marginLeft: '8px', color: 'var(--ion-color-medium)' }}>
                     📷 {t.attachments.length}
                  </span>
                )}
              </p>
            </IonLabel>
          </IonItem>

          {/* Options: Right Side (Delete) */}
          <IonItemOptions side="end">
            <IonItemOption color="danger" onClick={() => onDelete(t.id)}>
              <IonIcon slot="icon-only" icon={trashOutline} />
            </IonItemOption>
          </IonItemOptions>
          
        </IonItemSliding>
      ))}
    </IonList>
  );
};

export default TaskList;
