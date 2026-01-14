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
        <IonToolbar style={{ '--background': 'transparent', position: 'absolute', top: 0, width: '100%' }}>
          {/* Title removed for cleaner look, handled in content */}
          <IonButtons slot="end">
            <IonButton onClick={onClose} style={{ color: 'var(--ion-color-dark)', background: 'rgba(255,255,255,0.5)', borderRadius: '50%', width: '36px', height: '36px', margin: '8px' }}>
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
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          background: 'rgba(255, 255, 255, 0.4)', // Light glass
        }} className="apple-focus-container">
          
          <div style={{ marginBottom: '40px', textAlign: 'center', padding: '0 20px' }}>
            <IonText color="dark">
              <h2 style={{ fontSize: '28px', fontWeight: '800' }}>{task?.title || 'Sin tarea seleccionada'}</h2>
              <p style={{ opacity: 0.6, fontSize: '18px' }}>¡Concéntrate!</p>
            </IonText>
          </div>

          {/* Timer Circle */}
          <div style={{ position: 'relative', width: '280px', height: '280px', marginBottom: '40px' }}>
             <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.1))' }}>
               <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="6" />
               <circle cx="50" cy="50" r="45" fill="none" stroke="#007aff" strokeWidth="6" 
                 strokeDasharray="283" 
                 strokeDashoffset={dashoffset} 
                 strokeLinecap="round"
                 style={{ transition: 'stroke-dashoffset 1s linear' }}
               />
             </svg>
             <div style={{ 
               position: 'absolute', 
               top: 0, left: 0, right: 0, bottom: 0, 
               display: 'flex', alignItems: 'center', justifyContent: 'center',
               fontSize: '56px', fontWeight: '800',
               color: 'var(--ion-text-color)',
               fontVariantNumeric: 'tabular-nums'
             }}>
               {formatTime(timeLeft)}
             </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: '24px' }}>
             <IonButton 
               shape="round" 
               color={isActive ? "warning" : "primary"} 
               onClick={toggleTimer} 
               style={{ width: '80px', height: '80px', '--border-radius': '50%', '--box-shadow': '0 8px 24px rgba(0,0,0,0.15)' }}
             >
               <IonIcon icon={isActive ? pause : play} style={{ fontSize: '36px', color: 'white' }} />
             </IonButton>
             
             <IonButton 
               shape="round" 
               fill="solid"
               color="light"
               onClick={resetTimer} 
               style={{ width: '80px', height: '80px', '--border-radius': '50%', '--box-shadow': '0 8px 24px rgba(0,0,0,0.05)' }}
             >
               <IonIcon icon={refresh} style={{ fontSize: '32px', color: 'var(--ion-color-medium)' }} />
             </IonButton>
          </div>
          
          {task && (
             <IonButton 
               fill="clear" 
               color="success" 
               onClick={() => { onComplete(task.id); onClose(); }} 
               style={{ marginTop: '48px', fontWeight: 600, transform: 'scale(1.1)' }}
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
