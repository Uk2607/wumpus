import React from 'react';

interface Props {
  status: 'PLAYING' | 'WON' | 'LOST' | 'FORFEITED';
  score: number;
  onRestart: () => void;
}

export const GameOverModal: React.FC<Props> = ({ status, score, onRestart }) => {
  if (status === 'PLAYING') return null;

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div className="glass-panel" style={{
        backgroundColor: 'rgba(20, 20, 30, 0.8)', 
        border: `1px solid ${status === 'WON' ? 'var(--safe-cyan)' : 'var(--danger-red)'}`,
        padding: '40px', borderRadius: '16px', width: '320px',
        textAlign: 'center',
        boxShadow: `0 8px 32px ${status === 'WON' ? 'rgba(125,207,255,0.3)' : 'rgba(247,118,142,0.3)'}`
      }}>
        <h1 style={{ color: status === 'WON' ? 'var(--safe-cyan)' : 'var(--danger-red)', margin: '0 0 20px 0', fontSize: '2.5rem' }}>
          {status === 'WON' ? '🏆 VICTORY' : status === 'FORFEITED' ? '🏳️ FORFEITED' : '💀 GAME OVER'}
        </h1>
        <div style={{ fontSize: '1.5rem', marginBottom: '30px' }}>
          Final Score: <strong style={{ color: 'var(--accent-gold)' }}>{score}</strong>
        </div>
        <button 
          onClick={onRestart}
          style={{
            fontSize: '1.5rem', padding: '10px 30px',
            borderColor: status === 'WON' ? 'var(--safe-cyan)' : 'var(--danger-red)',
            color: status === 'WON' ? 'var(--safe-cyan)' : 'var(--danger-red)'
          }}
        >
          Play Again
        </button>
      </div>
    </div>
  );
};
