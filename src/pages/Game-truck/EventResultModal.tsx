// src/pages/Game-truck/EventResultModal.tsx

import React from 'react';

interface Consequence {
  tipo?: string;
  recurso?: string; // Agora opcional para efeitos especiais
  valor?: number;   // Agora opcional para efeitos especiais
  op?: 'add' | 'remove';
  acao?: string;    // Para efeitos de cadeia
  resultado?: string; // Para efeitos de fim de jogo
  motivo?: string;    // Para efeitos de fim de jogo
}

interface EventResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  consequences: Consequence[];
}

const formatResourceName = (resource: string) => {
  // Verificação de segurança
  if (!resource) return '';

  const names: { [key: string]: string } = {
    tempo_real: 'Tempo de Viagem',
    saldo: 'Saldo Financeiro',
    pontuacao: 'Pontuação',
    quantidade_carga: 'Carga',
    condicao_veiculo: 'Condição do Veículo',
    estresse_motorista: 'Estresse do Motorista',
    distancia_percorrida: 'Avanço na Rota',
  };
  return names[resource] || resource.replace(/_/g, ' ');
};

const getResourceIcon = (resource: string) => {
  // Verificação de segurança
  if (!resource) return '⚙️';

  const icons: { [key: string]: string } = {
    tempo_real: '⏱️',
    saldo: '💰',
    pontuacao: '⭐',
    quantidade_carga: '📦',
    condicao_veiculo: '🔧',
    estresse_motorista: '😥',
    distancia_percorrida: '➡️',
  };
  return icons[resource] || '⚙️';
};

const renderSpecialEffect = (effect: Consequence, index: number) => {
  // Efeito de cadeia de eventos
  if (effect.tipo === 'cadeia' && effect.acao === 'iniciar') {
    return (
      <li key={index} style={{
        backgroundColor: '#e8f4fd', padding: '10px', borderRadius: '8px',
        marginBottom: '8px', display: 'flex', alignItems: 'center',
        border: '2px solid #0077cc'
      }}>
        <span style={{ fontSize: '24px', marginRight: '15px' }}>
          🔗
        </span>
        <div style={{ flexGrow: 1, fontWeight: 'bold', color: '#0077cc' }}>
          Cadeia de Eventos Iniciada
        </div>
        <span style={{ fontWeight: 'bold', color: '#0077cc', fontSize: '16px' }}>
          ATIVA
        </span>
      </li>
    );
  }

  // Efeito de fim de jogo
  if (effect.tipo === 'fim_de_jogo') {
    return (
      <li key={index} style={{
        backgroundColor: '#fdeaea', padding: '10px', borderRadius: '8px',
        marginBottom: '8px', display: 'flex', alignItems: 'center',
        border: '2px solid #cc3300'
      }}>
        <span style={{ fontSize: '24px', marginRight: '15px' }}>
          🚨
        </span>
        <div style={{ flexGrow: 1, fontWeight: 'bold', color: '#cc3300' }}>
          Fim de Jogo: {effect.motivo || 'Partida encerrada'}
        </div>
      </li>
    );
  }

  return null;
};

const renderResourceEffect = (effect: Consequence, index: number) => {
  // Só renderiza se tiver recurso e valor
  if (!effect.recurso || effect.valor === undefined) {
    return null;
  }

  const isNegative =
    (effect.recurso === 'tempo_real' && effect.valor > 0) ||
    (effect.recurso === 'saldo' && effect.valor < 0) ||
    (effect.recurso === 'quantidade_carga' && effect.valor < 0) ||
    (effect.recurso === 'condicao_veiculo' && effect.valor < 0) ||
    (effect.recurso === 'estresse_motorista' && effect.valor > 0) ||
    (effect.op === 'remove');

  const valueColor = isNegative ? '#cc3300' : '#009933';

  let formattedValue = '';
  if (effect.tipo === 'recurso_percentual') {
    formattedValue = `-${(effect.valor * 100).toFixed(0)}%`;
  } else if (effect.recurso === 'saldo') {
    formattedValue = `R$ ${effect.valor.toFixed(2)}`;
  } else if (effect.recurso === 'tempo_real') {
    formattedValue = `${effect.valor} min`;
  } else if (effect.recurso === 'distancia_percorrida') {
    formattedValue = `${effect.valor} km`;
  } else {
    formattedValue = String(effect.valor);
  }

  return (
    <li key={index} style={{
      backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '8px',
      marginBottom: '8px', display: 'flex', alignItems: 'center'
    }}>
      <span style={{ fontSize: '24px', marginRight: '15px' }}>
        {getResourceIcon(effect.recurso)}
      </span>
      <div style={{ flexGrow: 1, fontWeight: 'bold' }}>
        {formatResourceName(effect.recurso)}
      </div>
      <span style={{ fontWeight: 'bold', color: valueColor, fontSize: '16px' }}>
        {effect.valor > 0 && effect.tipo !== 'recurso_percentual' ? '+' : ''}{formattedValue}
      </span>
    </li>
  );
};

export const EventResultModal: React.FC<EventResultModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  consequences,
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 3000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Silkscreen', monospace"
    }}>
      <div style={{
        backgroundColor: '#fff', border: '3px solid #000', borderRadius: '15px',
        padding: '25px', maxWidth: '500px', width: '90%',
        textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
      }}>
        <h2 style={{ color: '#e3922a', fontSize: '24px', marginBottom: '15px' }}>
          {title}
        </h2>
        <p style={{ color: '#333', fontSize: '16px', marginBottom: '20px', lineHeight: '1.5' }}>
          {description}
        </p>

        {consequences && consequences.length > 0 && (
          <div style={{
            borderTop: '2px dashed #ccc', paddingTop: '20px',
            marginBottom: '25px'
          }}>
            <h3 style={{ color: '#555', fontSize: '18px', marginBottom: '15px' }}>
              Consequências:
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, textAlign: 'left' }}>
              {consequences.map((effect, index) => {
                // Renderiza efeitos especiais primeiro
                const specialEffect = renderSpecialEffect(effect, index);
                if (specialEffect) {
                  return specialEffect;
                }

                // Depois renderiza efeitos de recursos normais
                return renderResourceEffect(effect, index);
              }).filter(Boolean)} {/* Remove elementos null */}
            </ul>
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            padding: '12px 30px', backgroundColor: '#0077cc', color: 'white',
            border: '2px solid #000', borderRadius: '8px', cursor: 'pointer',
            fontSize: '16px', fontWeight: 'bold', marginTop: '10px'
          }}
        >
          CONTINUAR VIAGEM
        </button>
      </div>
    </div>
  );
};