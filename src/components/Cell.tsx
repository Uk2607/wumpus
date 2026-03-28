import { CellData } from '../game/types';

interface Props {
  data: CellData;
  isPlayerHere: boolean;
  facing: string;
  simMode: boolean; // if true, reveals content X-ray style
}

export const Cell: React.FC<Props> = ({ data, isPlayerHere, facing, simMode }) => {
  const isRevealed = simMode || data.visited;
  
  let borderColor = 'var(--cell-border)';
  if (simMode) {
    if (data.knownSafe) borderColor = 'var(--safe-cyan)';
    else if (data.knownDanger) borderColor = 'var(--danger-red)';
    else if (data.uncertain) borderColor = 'var(--accent-gold)';
  }

  const getPlayerIcon = () => {
    switch (facing) {
      case 'N': return '▲';
      case 'E': return '▶';
      case 'S': return '▼';
      case 'W': return '◀';
      default: return '◉_◉';
    }
  };

  return (
    <div 
      className={`cell ${isRevealed ? 'glass-panel' : ''}`}
      style={{
        width: '100%',
        aspectRatio: '1/1',
        backgroundColor: isRevealed ? 'var(--cell-bg)' : 'var(--fog-bg)',
        border: `1px solid ${borderColor}`,
        borderRadius: '12px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        fontSize: 'clamp(0.8rem, 2vw, 1.5rem)',
        overflow: 'hidden',
        boxShadow: simMode && data.knownSafe ? '0 0 15px rgba(125, 207, 255, 0.15)' : 
                   simMode && data.knownDanger ? '0 0 15px rgba(247, 118, 142, 0.15)' : 'none',
        transition: 'all 0.3s ease'
      }}
    >
      {isRevealed && (
        <>
          <div style={{ position: 'absolute', top: 2, left: 2, display: 'flex', gap: '2px', fontSize: '0.8em' }}>
            {data.stench && <span>🤢</span>}
            {data.breeze && <span>💨</span>}
          </div>
          
          <div style={{ position: 'absolute', bottom: 2, right: 2, display: 'flex', gap: '2px' }}>
            {data.glitter && <span>✨</span>}
          </div>

          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '1.5em' }}>
            {data.hasPit && '🕳️'}
            {data.hasWumpus && '💀'}
            {data.hasGold && '🪙'}
          </div>
        </>
      )}

      {isPlayerHere && (
        <div style={{
           position: 'absolute', 
           zIndex: 10, 
           color: 'var(--accent-gold)', 
           textShadow: '0 0 5px #000',
           fontSize: '1.5em',
           // transform: `rotate(${facing === 'N' ? 0 : facing === 'E' ? 90 : facing === 'S' ? 180 : -90}deg)`
           // We're using direct arrow characters instead of rotating emoji since it can be inconsistent across OS.
        }}>
          {getPlayerIcon()}
        </div>
      )}

      {simMode && !data.visited && !data.hasWumpus && !data.hasPit && !data.hasGold && (
         <div style={{ opacity: 0.2 }}>❓</div>
      )}
    </div>
  );
};
