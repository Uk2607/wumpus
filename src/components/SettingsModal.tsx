import React from 'react';
import { AgentType } from '../game/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  gameMode: 'MANUAL' | 'SIMULATION';
  setGameMode: (m: 'MANUAL' | 'SIMULATION') => void;
  gridSize: number;
  setGridSize: (s: number) => void;
  wumpusCount: number;
  setWumpusCount: (c: number) => void;
  pitCount: number;
  setPitCount: (c: number) => void;
  goldCount: number;
  setGoldCount: (c: number) => void;
  showPerceptIcons: boolean;
  setShowPerceptIcons: (b: boolean) => void;
  arrows: number;
  setArrows: (n: number) => void;
  agentType: AgentType;
  setAgentType: (a: AgentType) => void;
  speedMs: number;
  setSpeedMs: (ms: number) => void;
  onRestart: () => void;
}

export const SettingsModal: React.FC<Props> = (props) => {
  if (!props.isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div className="glass-panel" style={{
        padding: '25px', width: '300px',
        display: 'flex', flexDirection: 'column', gap: '15px'
      }}>
        <h2 style={{ textAlign: 'center', margin: '0 0 10px 0' }}>⚙️ Settings</h2>

        <div>
          <label>Mode:</label>
          <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
            <button 
              style={{ flex: 1, borderColor: props.gameMode === 'MANUAL' ? 'var(--safe-cyan)' : '#555', color: props.gameMode === 'MANUAL' ? 'var(--safe-cyan)' : '#555' }}
              onClick={() => props.setGameMode('MANUAL')}
            >
              Manual
            </button>
            <button 
              style={{ flex: 1, borderColor: props.gameMode === 'SIMULATION' ? 'var(--safe-cyan)' : '#555', color: props.gameMode === 'SIMULATION' ? 'var(--safe-cyan)' : '#555' }}
              onClick={() => props.setGameMode('SIMULATION')}
            >
              AI Sim
            </button>
          </div>
        </div>

        <div>
          <label>Grid Size:</label>
          <select value={props.gridSize} onChange={e => props.setGridSize(Number(e.target.value))} style={{ width: '100%', marginTop: '5px' }}>
            <option value={4}>4x4</option>
            <option value={6}>6x6</option>
            <option value={8}>8x8</option>
            <option value={10}>10x10</option>
          </select>
        </div>

        <div>
          <label>Wumpuses:</label>
          <select value={props.wumpusCount} onChange={e => props.setWumpusCount(Number(e.target.value))} style={{ width: '100%', marginTop: '5px' }}>
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={5}>5</option>
          </select>
        </div>

        <div>
          <label>Golds:</label>
          <select value={props.goldCount} onChange={e => props.setGoldCount(Number(e.target.value))} style={{ width: '100%', marginTop: '5px' }}>
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={5}>5</option>
          </select>
        </div>

        <div>
          <label>Pits:</label>
          <select value={props.pitCount} onChange={e => props.setPitCount(Number(e.target.value))} style={{ width: '100%', marginTop: '5px' }}>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={7}>7</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
          </select>
        </div>

        <div>
          <label>Arrows:</label>
          <select value={props.arrows} onChange={e => props.setArrows(Number(e.target.value))} style={{ width: '100%', marginTop: '5px' }}>
            <option value={1}>1 Arrow</option>
            <option value={3}>3 Arrows</option>
            <option value={5}>5 Arrows</option>
          </select>
        </div>

        {props.gameMode === 'SIMULATION' && (
          <>
            <div>
              <label>Agent Type:</label>
              <select value={props.agentType} onChange={e => props.setAgentType(e.target.value as AgentType)} style={{ width: '100%', marginTop: '5px' }}>
                <option value="RANDOM">Random Agent</option>
                <option value="GREEDY">Greedy Safe Agent</option>
                <option value="LOGICAL">Logical Agent (KB)</option>
              </select>
            </div>
            <div>
              <label>Speed:</label>
              <select value={props.speedMs} onChange={e => props.setSpeedMs(Number(e.target.value))} style={{ width: '100%', marginTop: '5px' }}>
                <option value={50}>Ultra Fast (50ms)</option>
                <option value={100}>Fast (100ms)</option>
                <option value={500}>Medium (500ms)</option>
                <option value={2000}>Slow (2s)</option>
              </select>
            </div>
          </>
        )}

        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button style={{ flex: 1 }} onClick={props.onClose}>Close</button>
          <button style={{ flex: 1, backgroundColor: 'var(--danger-red)', color: 'white', borderColor: 'var(--danger-red)' }} onClick={() => {
            props.onClose();
            props.onRestart();
          }}>Apply & Reset</button>
        </div>
      </div>
    </div>
  );
};
