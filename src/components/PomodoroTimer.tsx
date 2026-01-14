import React, { useState, useEffect, useRef } from 'react';
import { IonButton, IonIcon, IonText, IonCard, IonCardContent } from '@ionic/react';
import { play, pause, refresh, cafeOutline, flame } from 'ionicons/icons';
import './PomodoroTimer.css';

const PomodoroTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [progress, setProgress] = useState(100);

  const duration = mode === 'focus' ? 25 * 60 : 5 * 60;
  
  // Audio for completion (optional, could be added)

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
        setProgress((timeLeft / duration) * 100);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Timer finished Logic
      if (mode === 'focus') {
        setMode('break');
        setTimeLeft(5 * 60);
      } else {
        setMode('focus');
        setTimeLeft(25 * 60);
      }
      setProgress(100);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, duration]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
    setProgress(100);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="pomodoro-container">
      {/* Mode Switcher */}
      <div className="mode-switcher glass-effect">
        <div 
          className={`mode-pill ${mode === 'focus' ? 'active' : ''}`}
          onClick={() => { setMode('focus'); setTimeLeft(25*60); setIsActive(false); }}
        >
          <IonIcon icon={flame} /> Focus
        </div>
        <div 
          className={`mode-pill ${mode === 'break' ? 'active' : ''}`}
          onClick={() => { setMode('break'); setTimeLeft(5*60); setIsActive(false); }}
        >
          <IonIcon icon={cafeOutline} /> Break
        </div>
      </div>

      {/* Circular Progress */}
      <div className="timer-display glass-effect">
         <div className="circle-wrap">
            <svg viewBox="0 0 100 100" className="progress-ring">
               <circle 
                  className="track" 
                  cx="50" cy="50" r="45" 
               />
               <circle 
                  className="indicator" 
                  cx="50" cy="50" r="45"
                  style={{ 
                    strokeDasharray: '283',
                    strokeDashoffset: (283 - (283 * progress) / 100).toString(),
                    stroke: mode === 'focus' ? '#ff6b6b' : '#4ecdc4'
                  }} 
               />
            </svg>
            <div className="time-text">
               {formatTime(timeLeft)}
            </div>
            <IonText color="medium" style={{position:'absolute', bottom:'20%', fontSize:'14px'}}>
              {isActive ? 'CORRIENDO' : 'PAUSADO'}
            </IonText>
         </div>
      </div>

      {/* Controls */}
      <div className="controls-row">
        <IonButton 
          shape="round" 
          onClick={toggleTimer} 
          size="large"
          className="control-btn"
          style={{ '--background': isActive ? '#ffcc00' : '#32cd32', width: '80px', height: '80px' }}
        >
          <IonIcon slot="icon-only" icon={isActive ? pause : play} style={{ color: 'white' }} />
        </IonButton>

        <IonButton 
          shape="round" 
          fill="clear" 
          onClick={resetTimer}
          className="control-btn-small"
        >
          <IonIcon slot="icon-only" icon={refresh} style={{ color: 'white', fontSize: '24px' }} />
        </IonButton>
      </div>

    </div>
  );
};

export default PomodoroTimer;
