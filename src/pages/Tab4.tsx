import React from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import PomodoroTimer from '../components/PomodoroTimer';
import './Tab4.css';

const Tab4: React.FC = () => {
  return (
    <IonPage>
      <IonContent fullscreen className="pomodoro-page">
        <div className="blobs-container">
           <div className="blob blob-1"></div>
           <div className="blob blob-2"></div>
        </div>
        
        <div className="ion-padding-top ion-text-center" style={{marginTop: '40px', position: 'relative', zIndex: 10}}>
          <h1 className="gradient-text" style={{fontSize: '32px', fontWeight: '800'}}>Modo Enfoque</h1>
          <p style={{color: 'var(--ion-color-medium)', marginTop: '-8px'}}>Bloquea distracciones</p>
        </div>

        <PomodoroTimer />
      </IonContent>
    </IonPage>
  );
};

export default Tab4;
