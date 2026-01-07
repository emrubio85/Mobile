import React, { useEffect, useState } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonButton,
  IonButtons,
  IonSelect,
  IonSelectOption
} from '@ionic/react';
import { Task } from '../models/task';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (t: Task) => void;
  editing?: Task | null;
}

const AddTaskModal: React.FC<Props> = ({ isOpen, onClose, onSave, editing }) => {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [due, setDue] = useState<string | undefined>(undefined);
  const [priority, setPriority] = useState<'low'|'medium'|'high'>('medium');

  useEffect(() => {
    if (editing) {
      setTitle(editing.title);
      setNotes(editing.notes || '');
      setDue(editing.due);
      setPriority(editing.priority || 'medium');
    } else {
      setTitle('');
      setNotes('');
      setDue(undefined);
      setPriority('medium');
    }
  }, [editing, isOpen]);

  function toLocalInputValue(iso?: string | undefined) {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    const YYYY = d.getFullYear();
    const MM = pad(d.getMonth() + 1);
    const DD = pad(d.getDate());
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    return `${YYYY}-${MM}-${DD}T${hh}:${mm}`;
  }

  function parseLocalInputToISOString(v: string) {
    // v is like 'YYYY-MM-DDTHH:MM' in local time
    if (!v) return undefined;
    const d = new Date(v);
    return d.toISOString();
  }

  function handleSave() {
    const now = new Date().toISOString();
    const task: Task = editing
      ? { ...editing, title, notes, due, priority }
      : { id: `${Date.now()}`, title, notes, due, completed: false, createdAt: now, priority };
    onSave(task);
    onClose();
  }

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{editing ? 'Editar tarea' : 'Nueva tarea'}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>Cerrar</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonItem>
          <IonLabel position="stacked">Título</IonLabel>
          <IonInput value={title} onIonChange={e => setTitle((e.target as any).value)} />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Fecha de vencimiento</IonLabel>
          <IonInput
            type="datetime-local"
            value={toLocalInputValue(due)}
            onIonChange={e => {
              const v = (e.target as any).value as string;
              setDue(v ? parseLocalInputToISOString(v) : undefined);
            }}
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Prioridad</IonLabel>
          <IonSelect value={priority} placeholder="Selecciona" onIonChange={e => setPriority((e.target as any).value)}>
            <IonSelectOption value="high">Alta</IonSelectOption>
            <IonSelectOption value="medium">Media</IonSelectOption>
            <IonSelectOption value="low">Baja</IonSelectOption>
          </IonSelect>
        </IonItem>
        <div style={{ marginTop: 16 }}>
          {(() => {
            const saveDisabled = !title.trim() || (due ? new Date(due).getTime() < Date.now() : false);
            return (
              <IonButton expand="block" onClick={handleSave} disabled={saveDisabled}>
                Guardar
              </IonButton>
            );
          })()}
        </div>
      </IonContent>
    </IonModal>
  );
};

export default AddTaskModal;
