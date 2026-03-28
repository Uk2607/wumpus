import { CellData } from '../game/types';
import { Navigation, Skull, CircleDashed, Coins, Wind, Biohazard, Sparkles, HelpCircle } from 'lucide-react';

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

  const getRotationAngle = () => {
    // Navigation icon natively points top-right (45deg), so we subtract 45 to point straight up for 'N'
    const offset = -45;
    switch (facing) {
      case 'N': return 0 + offset;
      case 'E': return 90 + offset;
      case 'S': return 180 + offset;
      case 'W': return -90 + offset;
      default: return 0 + offset;
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
          <div style={{ position: 'absolute', top: 2, left: 2, display: 'flex', gap: '4px', padding: '2px' }}>
            {data.stench && <Biohazard size={16} color="#a8ff5c" />}
            {data.breeze && <Wind size={16} color="lightblue" />}
          </div>
          
          <div style={{ position: 'absolute', bottom: 2, right: 2, display: 'flex', gap: '4px', padding: '2px' }}>
            {data.glitter && <Sparkles size={16} color="gold" />}
          </div>

          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {data.hasPit && <CircleDashed size={32} fill="#111" color="#555" />}
            {data.hasWumpus && !data.hasPit && !data.hasGold && <Skull size={32} color="var(--danger-red)" />}
            {data.hasGold && !data.hasPit && <Coins size={32} color="gold" />}
          </div>
        </>
      )}

      {isPlayerHere && (
        <div style={{
           position: 'absolute', 
           zIndex: 10, 
           transform: `rotate(${getRotationAngle()}deg)`,
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'center',
           filter: 'drop-shadow(0 0 5px rgba(0,0,0,0.8))'
        }}>
          <Navigation size={28} color="var(--accent-gold)" fill="var(--accent-gold)" />
        </div>
      )}

      {simMode && !data.visited && !data.hasWumpus && !data.hasPit && !data.hasGold && (
         <div style={{ opacity: 0.2 }}><HelpCircle size={24} /></div>
      )}
    </div>
  );
};
