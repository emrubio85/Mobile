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
  IonItemOption,
  IonText
} from '@ionic/react';
import { trash, create } from 'ionicons/icons';
import { Task } from '../models/task';

interface Props {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

const TaskList: React.FC<Props> = ({ tasks, onToggle, onDelete, onEdit }) => {
  if (!tasks.length) return <IonText className="ion-padding">No hay tareas aún.</IonText>;

  return (
    <IonList>
      {tasks.map(t => (
        <IonItemSliding key={t.id}>
          <IonItem>
            <IonCheckbox slot="start" checked={t.completed} onIonChange={() => onToggle(t.id)} />
            <IonLabel>
              <h3 style={{ textDecoration: t.completed ? 'line-through' : 'none' }}>{t.title}</h3>
              <p style={{ margin: 0 }}>
                {t.priority && <strong>Prioridad: </strong>} {t.priority ? t.priority : ''}
              </p>
              {t.due && <p>Vence: {new Date(t.due).toLocaleString()}</p>}
            </IonLabel>
          </IonItem>
          <IonItemOptions side="end">
            <IonItemOption color="primary" onClick={() => onEdit(t)}>
              <IonIcon icon={create} /> Editar
            </IonItemOption>
            <IonItemOption color="danger" onClick={() => onDelete(t.id)}>
              <IonIcon icon={trash} /> Borrar
            </IonItemOption>
          </IonItemOptions>
        </IonItemSliding>
      ))}
    </IonList>
  );
};

export default TaskList;
