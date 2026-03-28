import React from 'react';
import { GameState } from '../game/types';

interface Props {
  gameState: GameState;
  onRestart: () => void;
  onClimbOut: () => void;
  openSettings: () => void;
  onForfeit: () => void;
  onAIHelp: () => void;
}

export const StatsPanel: React.FC<Props> = ({ gameState, onRestart, onClimbOut, openSettings, onForfeit, onAIHelp }) => {
  return (
    <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h2 className="title-flicker" style={{ fontSize: '1.8rem', margin: '0' }}>HUNT THE WUMPUS</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '1.05rem' }}>
        <div className="badge">🏹 <span style={{ color: 'var(--text-main)' }}>Arrows:</span> <span style={{ color: 'var(--accent-gold)' }}>{gameState.arrows}</span></div>
        <div className="badge">💀 <span style={{ color: 'var(--text-main)' }}>Wumpus:</span> <span style={{ color: gameState.wumpuses.some(w => w.alive) ? 'var(--text-main)' : 'var(--danger-red)' }}>{gameState.wumpuses.filter(w => !w.alive).length}/{gameState.wumpuses.length} Dead</span></div>
        <div className="badge">🕳️ <span style={{ color: 'var(--text-main)' }}>Pits:</span> {gameState.pits.length}</div>
        <div className="badge">🪙 <span style={{ color: 'var(--text-main)' }}>Gold:</span> <span style={{ color: gameState.golds.every(g => g.collected) ? 'var(--accent-gold)' : 'var(--text-main)' }}>{gameState.golds.filter(g => g.collected).length}/{gameState.golds.length} Held</span></div>
        <div className="badge">📍 <span style={{ color: 'var(--text-main)' }}>Pos:</span> ({gameState.playerPos.r},{gameState.playerPos.c})</div>
        <div className="badge">🧭 <span style={{ color: 'var(--text-main)' }}>Facing:</span> {gameState.facing}</div>
        <div className="badge">👣 <span style={{ color: 'var(--text-main)' }}>Moves:</span> {gameState.movesMade}</div>
        <div className="badge">🏆 <span style={{ color: 'var(--text-main)' }}>Score:</span> <span style={{ color: gameState.score < 0 ? 'var(--danger-red)' : 'var(--safe-cyan)' }}>{gameState.score}</span></div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 'auto' }}>
        <button 
          onClick={onClimbOut} 
          disabled={!gameState.golds.every(g => g.collected) || gameState.playerPos.r !== 0 || gameState.playerPos.c !== 0 || gameState.status !== 'PLAYING'}
          style={{ 
            borderColor: 'var(--safe-cyan)', 
            color: 'var(--safe-cyan)',
            boxShadow: (!gameState.golds.every(g => g.collected) || gameState.playerPos.r !== 0 || gameState.playerPos.c !== 0) ? 'none' : '0 0 10px rgba(125,207,255,0.3)' 
          }}
        >
          🧗 Climb Out
        </button>

        {gameState.mode === 'MANUAL' && gameState.status === 'PLAYING' && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button style={{ flex: 1, borderColor: 'var(--danger-red)', color: 'var(--danger-red)' }} onClick={onForfeit}>🛑 Forfeit</button>
            <button style={{ flex: 1, borderColor: 'var(--accent-gold)', color: 'var(--accent-gold)' }} onClick={onAIHelp}>🤖 AI Help</button>
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={{ flex: 1 }} onClick={onRestart}>🔄 Restart</button>
          <button style={{ flex: 1 }} onClick={openSettings}>⚙️ Settings</button>
        </div>
      </div>

      <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
        <div style={{ marginBottom: '6px', color: 'var(--text-highlight)' }}>Manual Controls:</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', gap: '4px' }}>
          <span><strong>↑↓←→</strong> : Move Player</span>
          <span><strong>W S A D</strong> : Turn in-place</span>
          <span><strong>Space</strong> : Shoot (Facing Dir)</span>
          <span><strong>P / Enter</strong> : Pick up Gold</span>
        </div>
      </div>
    </div>
  );
};
