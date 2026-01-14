import React, { useState, useEffect, useRef } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonButtons,
  IonText
} from '@ionic/react';
import { closeOutline, play, pause, refresh, checkmarkDone } from 'ionicons/icons';
import { Task } from '../models/task';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  onComplete: (taskId: string) => void;
}

const FocusModal: React.FC<Props> = ({ isOpen, onClose, task, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(25 * 60);
      setIsActive(false);
    }
    return () => stopTimer();
  }, [isOpen]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      stopTimer();
      // Timer finished!
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  function stopTimer() {
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }

  function toggleTimer() {
    setIsActive(!isActive);
  }

  function resetTimer() {
    stopTimer();
    setTimeLeft(25 * 60);
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = timeLeft / (25 * 60);
  const dashoffset = 283 * (1 - progress); // 283 is approx circumference of r=45

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} className="focus-modal">
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': 'transparent', color: 'white', position: 'absolute', top: 0, width: '100%' }}>
          <IonTitle>Modo Enfoque 🍅</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose} style={{ color: 'white' }}>
              <IonIcon icon={closeOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen style={{ '--background': 'transparent' }}>
        <div style={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          background: 'linear-gradient(180deg, rgba(0, 51, 102, 0.85) 0%, rgba(0, 30, 60, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          color: 'white'
        }}>
          
          <div style={{ marginBottom: '40px', textAlign: 'center', padding: '0 20px' }}>
            <IonText color="light">
              <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>{task?.title || 'Sin tarea seleccionada'}</h2>
              <p style={{ opacity: 0.8 }}>¡Concéntrate!</p>
            </IonText>
          </div>

          {/* Timer Circle */}
          <div style={{ position: 'relative', width: '250px', height: '250px', marginBottom: '40px' }}>
             <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
               <circle cx="50" cy="50" r="45" fill="none" stroke="#00509e" strokeWidth="5" />
               <circle cx="50" cy="50" r="45" fill="none" stroke="#ffffff" strokeWidth="5" 
                 strokeDasharray="283" 
                 strokeDashoffset={dashoffset} 
                 style={{ transition: 'stroke-dashoffset 1s linear' }}
               />
             </svg>
             <div style={{ 
               position: 'absolute', 
               top: 0, left: 0, right: 0, bottom: 0, 
               display: 'flex', alignItems: 'center', justifyContent: 'center',
               fontSize: '48px', fontWeight: '800'
             }}>
               {formatTime(timeLeft)}
             </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: '20px' }}>
             <IonButton 
               shape="round" 
               color={isActive ? "warning" : "success"} 
               onClick={toggleTimer} 
               style={{ width: '80px', height: '80px', '--border-radius': '50%' }}
             >
               <IonIcon icon={isActive ? pause : play} style={{ fontSize: '32px' }} />
             </IonButton>
             
             <IonButton 
               shape="round" 
               color="light" 
               fill="outline"
               onClick={resetTimer} 
               style={{ width: '80px', height: '80px', '--border-radius': '50%' }}
             >
               <IonIcon icon={refresh} style={{ fontSize: '32px' }} />
             </IonButton>
          </div>
          
          {task && (
             <IonButton 
               fill="clear" 
               color="light" 
               onClick={() => { onComplete(task.id); onClose(); }} 
               style={{ marginTop: '40px' }}
             >
               <IonIcon slot="start" icon={checkmarkDone} />
               Terminé esta tarea
             </IonButton>
          )}

        </div>
      </IonContent>
    </IonModal>
  );
};

export default FocusModal;
