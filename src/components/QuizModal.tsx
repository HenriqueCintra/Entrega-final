import React, { useState } from 'react';
import { PerguntaQuiz, ResponderQuizPayload } from '../api/gameService';

interface QuizModalProps {
  isOpen: boolean;
  question: PerguntaQuiz;
  onAnswerSubmit: (payload: ResponderQuizPayload) => Promise<{ correta: boolean; detail: string }>;
  onClose: () => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({ isOpen, question, onAnswerSubmit, onClose }) => {
  const [isAnswered, setIsAnswered] = useState(false);
  const [feedback, setFeedback] = useState({ correct: false, message: '' });
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleOptionClick = async (optionId: number) => {
    if (isAnswered) return;
    
    setSelectedOptionId(optionId);
    const result = await onAnswerSubmit({
      pergunta_id: question.id,
      opcao_id: optionId,
    });
    
    setFeedback({ correct: result.correta, message: result.detail });
    setIsAnswered(true);

    // Fecha o modal após 3 segundos
    setTimeout(() => {
      onClose();
      // Resetar estado para o próximo quiz
      setIsAnswered(false);
      setFeedback({ correct: false, message: '' });
      setSelectedOptionId(null);
    }, 3000);
  };

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)', // Centraliza o elemento
      zIndex: 2500,
      fontFamily: "'Silkscreen', monospace"
    }}>
      <div style={{
        width: '380px', backgroundColor: '#fff', border: '3px solid #000', borderRadius: '15px',
        padding: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        transition: 'all 0.3s ease-in-out',
        transform: isOpen ? 'translateX(0)' : 'translateX(110%)',
      }}>
        {!isAnswered ? (
          <>
            <h3 style={{ color: '#0077cc', fontSize: '16px', marginBottom: '15px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
              🧠 QUIZ RÁPIDO!
            </h3>
            <p style={{ color: '#333', fontSize: '14px', marginBottom: '20px', minHeight: '60px' }}>
              {question.texto}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {question.opcoes.map(opcao => (
                <button
                  key={opcao.id}
                  onClick={() => handleOptionClick(opcao.id)}
                  style={{
                    padding: '12px', border: '2px solid #333', borderRadius: '8px',
                    backgroundColor: '#f0f0f0', cursor: 'pointer', textAlign: 'left',
                    fontSize: '12px', transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#ddd'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                >
                  {opcao.texto}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', minHeight: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 style={{ fontSize: '24px', color: feedback.correct ? '#00cc66' : '#cc3300' }}>
              {feedback.correct ? 'RESPOSTA CORRETA!' : 'RESPOSTA INCORRETA!'}
            </h3>
            <p style={{ marginTop: '10px', fontSize: '14px', color: '#555' }}>
              {feedback.message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
