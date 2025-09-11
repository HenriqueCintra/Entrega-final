// src/components/QuizModal.tsx

import React, { useState } from 'react';
import { PerguntaQuiz, ResponderQuizPayload } from '../api/gameService';

interface QuizModalProps {
  isOpen: boolean;
  question: PerguntaQuiz;
  onAnswerSubmit: (payload: ResponderQuizPayload) => Promise<{ correta: boolean; detail: string; correta_id?: number }>;
  onClose: () => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({ isOpen, question, onAnswerSubmit, onClose }) => {
  const [isAnswered, setIsAnswered] = useState(false);
  const [feedback, setFeedback] = useState({ correct: false, message: '' });
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [correctOptionId, setCorrectOptionId] = useState<number | null>(null);

  // --- PASSO A: NOVO ESTADO PARA CONTROLAR A ANIMAÇÃO DE SAÍDA ---
  const [isClosing, setIsClosing] = useState(false);

  if (!isOpen) return null;

  // --- PASSO B: NOVA FUNÇÃO PARA INICIAR O FECHAMENTO ---
  const handleCloseAnimation = () => {
    setIsClosing(true);
  };

  const handleOptionClick = async (optionId: number) => {
    if (isAnswered) return;
    setSelectedOptionId(optionId);
    
    const result = await onAnswerSubmit({
      pergunta_id: question.id,
      opcao_id: optionId,
    });
    
    setFeedback({ correct: result.correta, message: result.detail });
    
    if (!result.correta && result.correta_id) {
      setCorrectOptionId(result.correta_id);
    }
    
    setIsAnswered(true);

    // --- PASSO C: MODIFICAÇÃO NA LÓGICA DE FECHAMENTO ---
    // Em vez de chamar onClose diretamente, iniciamos a animação de saída.
    setTimeout(() => {
      handleCloseAnimation();
    }, 4000);
  };

  const getButtonStyle = (optionId: number) => {
    // ... (função getButtonStyle continua exatamente igual à anterior)
    if (!isAnswered) {
      return { backgroundColor: '#f0f0f0', border: '2px solid #333' };
    }
    const isSelected = selectedOptionId === optionId;
    const isCorrect = correctOptionId === optionId || (isSelected && feedback.correct);
    if (isCorrect) {
      return { backgroundColor: '#28a745', border: '2px solid #155724', color: 'white', transform: 'scale(1.02)' };
    }
    if (isSelected && !feedback.correct) {
      return { backgroundColor: '#dc3545', border: '2px solid #721c24', color: 'white' };
    }
    return { backgroundColor: '#f8f9fa', border: '2px solid #adb5bd', opacity: 0.7 };
  };

  return (
    <div style={{
      position: 'fixed', top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)', zIndex: 2500,
      fontFamily: "'Silkscreen', monospace"
    }}>
      <div 
        style={{
          width: '380px', backgroundColor: '#fff', border: '3px solid #000',
          borderRadius: '15px', padding: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          // --- PASSO D: APLICAR ANIMAÇÃO CONDICIONALMENTE ---
          animation: isClosing ? 'zoomOut 0.3s ease-in forwards' : 'zoomIn 0.3s ease-out'
        }}
        // --- PASSO D: OUVIR O FIM DA ANIMAÇÃO PARA FECHAR DE VERDADE ---
        onAnimationEnd={() => {
          if (isClosing) {
            onClose();
          }
        }}
      >
        {!isAnswered ? (
          <>
            {/* O conteúdo aqui continua o mesmo */}
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
                    padding: '12px', borderRadius: '8px', cursor: 'pointer',
                    textAlign: 'left', fontSize: '12px', transition: 'all 0.2s',
                    ...getButtonStyle(opcao.id)
                  }}
                  disabled={isAnswered}
                >
                  {opcao.texto}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', minHeight: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {/* O conteúdo aqui também continua o mesmo */}
            <h3 style={{ 
                fontSize: '24px', 
                color: feedback.correct ? '#28a745' : '#dc3545',
                animation: 'popIn 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55)'
            }}>
              {feedback.correct ? 'RESPOSTA CORRETA!' : 'RESPOSTA INCORRETA!'}
            </h3>
            <p style={{ marginTop: '10px', fontSize: '14px', color: '#555' }}>
              {feedback.message}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
              {question.opcoes.map(opcao => (
                <button
                  key={opcao.id}
                  style={{
                    padding: '12px', borderRadius: '8px', textAlign: 'left', 
                    fontSize: '12px', transition: 'all 0.2s',
                    ...getButtonStyle(opcao.id)
                  }}
                  disabled
                >
                  {opcao.texto}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
