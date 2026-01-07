import React, { useEffect, useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonFab,
  IonFabButton,
  IonIcon,
  IonBadge,
  IonProgressBar,
  IonAlert,
  IonToast,
  IonSegment,
  IonSegmentButton,
  IonLabel
} from '@ionic/react';
import { add } from 'ionicons/icons';
import './Tab1.css';
import TaskList from '../components/TaskList';
import AddTaskModal from '../components/AddTaskModal';
import { Task } from '../models/task';
import { loadTasks, saveTasks } from '../utils/storage';
import { removeTask } from '../utils/storage';
import { requestPermission, scheduleForTask, cancelForTask, rescheduleAll } from '../utils/notifications';

const Tab1: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [lastDeleted, setLastDeleted] = useState<Task | null>(null);
  const [showUndoToast, setShowUndoToast] = useState(false);
  const undoTimer = React.useRef<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all');

  useEffect(() => {
    (async () => {
      const t = await loadTasks();
      setTasks(t);
      // request permission and reschedule notifications for existing tasks
      await requestPermission();
      await rescheduleAll(t);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      await saveTasks(tasks);
    })();
  }, [tasks]);

  function handleSave(task: Task) {
    setTasks(prev => {
      const exists = prev.find(p => p.id === task.id);
      if (exists) return prev.map(p => (p.id === task.id ? task : p));
      // schedule notification for new task
      scheduleForTask(task).catch(() => {});
      return [task, ...prev];
    });
  }

  function toggle(id: string) {
    setTasks(prev => {
      const newState = prev.map(p => {
        if (p.id !== id) return p;
        const willComplete = !p.completed;
        return willComplete
          ? { ...p, completed: true, completedAt: new Date().toISOString() }
          : { ...p, completed: false, completedAt: undefined };
      });
      const updated = newState.find(x => x.id === id);
      if (updated) {
        if (updated.completed) {
          cancelForTask(id).catch(() => {});
        } else {
          scheduleForTask(updated).catch(() => {});
        }
      }
      return newState;
    });
  }

  function remove(id: string) {
    // llama solo despues de una confirmacion
    const task = tasks.find(t => t.id === id) || null;
    if (task) {
      setLastDeleted(task);
      setTasks(prev => prev.filter(p => p.id !== id));
      cancelForTask(id).catch(() => {});
      // update persistent storage
      removeTask(id).catch(() => {});
      // muestara undo toast
      if (undoTimer.current) {
        clearTimeout(undoTimer.current);
      }
      setShowUndoToast(true);
      undoTimer.current = window.setTimeout(() => {
        setShowUndoToast(false);
        setLastDeleted(null);
        undoTimer.current = null;
      }, 8000) as unknown as number;
    }
  }

  function startEdit(t: Task) {
    setEditing(t);
    setShowModal(true);
  }

  function requestDelete(id: string) {
    setPendingDeleteId(id);
    setShowConfirm(true);
  }

  function confirmDelete() {
    if (pendingDeleteId) {
      remove(pendingDeleteId);
      setPendingDeleteId(null);
    }
    setShowConfirm(false);
  }

  function cancelDelete() {
    setPendingDeleteId(null);
    setShowConfirm(false);
  }

  function handleUndo() {
    if (lastDeleted) {
      // restore
      setTasks(prev => [lastDeleted as Task, ...prev]);
      scheduleForTask(lastDeleted).catch(() => {});
      setLastDeleted(null);
    }
    setShowUndoToast(false);
    if (undoTimer.current) {
      clearTimeout(undoTimer.current);
      undoTimer.current = null;
    }
  }

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = tasks.length ? completedCount / tasks.length : 0;

  function isSameDay(d1: Date, d2: Date) {
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
  }

  const filteredAndSorted = React.useMemo(() => {
    const now = new Date();
    let list = tasks.slice();
    // filtering
    if (filter === 'today') {
      list = list.filter(t => t.due && isSameDay(new Date(t.due), now) && !t.completed);
    } else if (filter === 'upcoming') {
      list = list.filter(t => t.due && new Date(t.due) > now && !isSameDay(new Date(t.due), now) && !t.completed);
    } else if (filter === 'completed') {
      list = list.filter(t => t.completed);
    }

    // sort by priority (high, medium, low) then due date asc then createdAt desc
    const priorityRank = (p?: string) => (p === 'high' ? 0 : p === 'medium' ? 1 : 2);
    list.sort((a, b) => {
      const pa = priorityRank(a.priority);
      const pb = priorityRank(b.priority);
      if (pa !== pb) return pa - pb;
      if (a.due && b.due) return new Date(a.due).getTime() - new Date(b.due).getTime();
      if (a.due) return -1;
      if (b.due) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return list;
  }, [tasks, filter]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Gestor de Tiempo</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Tareas</IonTitle>
          </IonToolbar>
        </IonHeader>

        <div style={{ padding: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Tus tareas</h2>
            <div style={{ textAlign: 'right' }}>
              <IonBadge>{completedCount}/{tasks.length}</IonBadge>
            </div>
          </div>
          <IonProgressBar value={progress} />
        </div>

        <div style={{ padding: 12 }}>
          <IonSegment value={filter} onIonChange={e => setFilter((e.target as any).value)}>
            <IonSegmentButton value="all">
              <IonLabel>Todo</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="today">
              <IonLabel>Hoy</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="upcoming">
              <IonLabel>Próximas</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="completed">
              <IonLabel>Completadas</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </div>

        <TaskList tasks={filteredAndSorted} onToggle={toggle} onDelete={requestDelete} onEdit={startEdit} />

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => { setEditing(null); setShowModal(true); }}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        <AddTaskModal isOpen={showModal} onClose={() => setShowModal(false)} onSave={handleSave} editing={editing} />

        <IonAlert
          isOpen={showConfirm}
          header="Confirmar"
          message="¿Deseas eliminar esta tarea?"
          buttons={[{ text: 'Cancelar', role: 'cancel', handler: cancelDelete }, { text: 'Borrar', handler: confirmDelete }]} />

        <IonToast
          isOpen={showUndoToast}
          message="Tarea eliminada"
          duration={8000}
          buttons={[{ side: 'end', text: 'Deshacer', handler: handleUndo }]}
          onDidDismiss={() => { setShowUndoToast(false); }}
        />
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
