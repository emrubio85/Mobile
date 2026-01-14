import React, { useState } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonInput
} from '@ionic/react';
import { User } from '../utils/userStorage';

interface Props {
  isOpen: boolean;
  onComplete: (user: User) => void;
}

const WelcomeModal: React.FC<Props> = ({ isOpen, onComplete }) => {
  const [name, setName] = useState('');

  const handleSubmit = () => {
    if (name.trim()) {
      const newUser: User = {
        name: name.trim(),
        createdAt: new Date().toISOString()
      };
      onComplete(newUser);
    }
  };

  return (
    <IonModal isOpen={isOpen} backdropDismiss={false}>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': 'transparent' }}>
          <IonTitle style={{ fontWeight: 700 }}>Bienvenido</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="modal-content">
        <div style={{ 
          padding: '60px 32px', 
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '100%',
          justifyContent: 'center'
        }}>
          <h1 style={{ 
            fontWeight: '800', 
            fontSize: '34px', 
            marginBottom: '12px',
            letterSpacing: '-0.5px'
          }}>
            Bienvenido
          </h1>
          <p style={{ 
            color: 'var(--ion-color-medium)', 
            marginBottom: '48px',
            fontSize: '17px',
            lineHeight: '1.4',
            maxWidth: '280px'
          }}>
            Para comenzar, cuéntanos cómo te llamas
          </p>

          <div style={{ width: '100%', maxWidth: '320px' }}>
            <IonInput
              value={name}
              placeholder="Tu nombre"
              onIonChange={e => setName(e.detail.value!)}
              className="apple-input"
              style={{ 
                marginBottom: '24px',
                fontSize: '17px'
              }}
            />

            <IonButton
              expand="block"
              onClick={handleSubmit}
              disabled={!name.trim()}
              className="apple-button"
              style={{
                height: '56px',
                fontSize: '17px',
                marginTop: '16px'
              }}
            >
              Comenzar
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default WelcomeModal;
