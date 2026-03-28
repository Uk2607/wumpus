import React from 'react';
import { Skull, CircleDashed, Coins, Wind, Biohazard, Navigation, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div className="glass-panel" style={{
        padding: '25px', width: '400px', maxWidth: '90%',
        display: 'flex', flexDirection: 'column', gap: '15px',
        maxHeight: '90vh', overflowY: 'auto'
      }}>
        <h2 style={{ textAlign: 'center', margin: '0 0 10px 0', color: 'var(--accent-gold)' }}>How to Play</h2>

        <div style={{ lineHeight: '1.5' }}>
          <p><strong>Goal:</strong> Find the gold and safely return to the starting cell (0,0) to climb out. Avoid pits and the Wumpus!</p>
          
          <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '5px' }}>Icons</h3>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Navigation size={20} color="var(--accent-gold)" style={{ transform: 'rotate(-45deg)' }} /> <span><strong>Player:</strong> Shows your position and facing direction.</span></li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Skull size={20} color="var(--danger-red)" /> <span><strong>Wumpus:</strong> Will eat you! Avoid or shoot it.</span></li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CircleDashed size={20} fill="#111" color="#555" /> <span><strong>Pit:</strong> Bottomless pit. Falling in is fatal.</span></li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Coins size={20} color="gold" /> <span><strong>Gold:</strong> Collect this to win!</span></li>
          </ul>

          <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '5px' }}>Percepts (Clues)</h3>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Biohazard size={20} color="#a8ff5c" /> <span><strong>Stench:</strong> The Wumpus is in an adjacent cell!</span></li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Wind size={20} color="lightblue" /> <span><strong>Breeze:</strong> A Pit is in an adjacent cell!</span></li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Sparkles size={20} color="gold" /> <span><strong>Glitter:</strong> The Gold is in this exact cell!</span></li>
          </ul>

          <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '5px' }}>Actions</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <li>- Move using <strong>Arrow Keys</strong> or WASD (to turn)</li>
            <li>- Shoot your arrow (<strong>Space</strong>) in the direction you are facing to kill the Wumpus.</li>
            <li>- Grab the Gold (<strong>Enter / P</strong>) when you find it.</li>
            <li>- Climb out once you return to the start with the gold.</li>
          </ul>
        </div>
        
        <button style={{ marginTop: '10px' }} onClick={onClose}>Understood!</button>
      </div>
    </div>
  );
};
