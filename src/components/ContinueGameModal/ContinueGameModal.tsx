// src/components/ContinueGameModal/ContinueGameModal.tsx

import React from 'react';

/**
 * Interface para as propriedades que o componente do modal recebe.
 * @param isOpen - Controla se o modal está visível ou não.
 * @param onContinue - Função a ser chamada quando o usuário clica em "Continuar Partida".
 * @param onNewGame - Função a ser chamada quando o usuário clica em "Nova Viagem".
 */
interface ContinueGameModalProps {
  isOpen: boolean;
  onContinue: () => void;
  onNewGame: () => void;
}

export const ContinueGameModal: React.FC<ContinueGameModalProps> = ({ isOpen, onContinue, onNewGame }) => {
  // Se o modal não deve estar aberto, não renderiza nada.
  if (!isOpen) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 5000,
      fontFamily: "'Silkscreen', monospace",
      padding: '15px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '15px',
        border: '3px solid #000',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        textAlign: 'center',
        maxWidth: '500px',
        width: '100%',
        animation: 'fadeIn 0.3s ease-out' 
      }}>
        <h2 style={{
          color: "#E3922A",
          textShadow: "2px 2px 0px #000",
          marginBottom: '20px',
          fontSize: '24px',
          lineHeight: '1.2'
        }}>
          Partida em Andamento
        </h2>
        <p style={{ fontSize: '16px', marginBottom: '30px', color: '#333' }}>
          Detectamos uma viagem não finalizada. Deseja continuar de onde parou ou iniciar uma nova?
        </p>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={onNewGame}
            style={{
              padding: '12px 24px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: '2px solid black',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              boxShadow: '3px 3px 0px black',
              transition: 'all 0.1s ease-in-out',
            }}
            onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(2px)'; e.currentTarget.style.boxShadow = '1px 1px 0px black'; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '3px 3px 0px black'; }}
          >
            Nova Viagem
          </button>
          <button
            onClick={onContinue}
            style={{
              padding: '12px 24px',
              backgroundColor: '#28a745',
              color: 'white',
              border: '2px solid black',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              boxShadow: '3px 3px 0px black',
              transition: 'all 0.1s ease-in-out',
            }}
            onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(2px)'; e.currentTarget.style.boxShadow = '1px 1px 0px black'; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '3px 3px 0px black'; }}
          >
            Continuar Partida
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};