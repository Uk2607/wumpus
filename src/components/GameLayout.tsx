import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useGame } from '../hooks/useGame';
import { GridMap } from './GridMap';
import { StatsPanel } from './StatsPanel';
import { LogPanel } from './LogPanel';
import { SettingsModal } from './SettingsModal';
import { GameOverModal } from './GameOverModal';
import { HowToPlayModal } from './HowToPlayModal';
import type { AgentType } from '../game/types';
import type { Agent } from '../agent/AgentModel';
import { RandomAgent } from '../agent/RandomAgent';
import { LogicalAgent } from '../agent/LogicalAgent';
import { GreedySafeAgent } from '../agent/GreedySafeAgent';

export const GameLayout: React.FC = () => {
  const { gameState, logs, initGame, movePlayer, pickupGold, turnPlayer, shootArrow, climbOut, getCellData, addLog, setGameState, forfeitGame } = useGame();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [gameMode, setGameMode] = useState<'MANUAL' | 'SIMULATION'>('MANUAL');
  const [gridSize, setGridSize] = useState(6);
  const [arrows, setArrows] = useState(3);
  const [showPerceptIcons, setShowPerceptIcons] = useState(true);

  const [wumpusCount, setWumpusCount] = useState(1);
  const [pitCount, setPitCount] = useState(4);
  const [goldCount, setGoldCount] = useState(1);

  // Sim state
  const [agentType, setAgentType] = useState<AgentType>('LOGICAL');
  const [speedMs, setSpeedMs] = useState(500);
  const [simPaused, setSimPaused] = useState(true);

  const agentRef = useRef<Agent | null>(null);

  // Initialize game on mount
  useEffect(() => {
    initGame(gridSize, arrows, gameMode, wumpusCount, pitCount, goldCount);
    // eslint-disable-next-line
  }, []);

  const handleRestart = useCallback(() => {
    initGame(gridSize, arrows, gameMode, wumpusCount, pitCount, goldCount);
    setSimPaused(true);
    agentRef.current = null;
  }, [initGame, gridSize, arrows, gameMode, wumpusCount, pitCount, goldCount]);

  // Handle Keyboard for Manual Mode
  useEffect(() => {
    if (gameState?.mode !== 'MANUAL' || gameState.status !== 'PLAYING') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if they are inside an input/select
      if (document.activeElement?.tagName === 'SELECT' || document.activeElement?.tagName === 'INPUT') return;

      switch (e.key.toLowerCase()) {
        case 'arrowup': e.preventDefault(); movePlayer('N'); break;
        case 'arrowdown': e.preventDefault(); movePlayer('S'); break;
        case 'arrowleft': e.preventDefault(); movePlayer('W'); break;
        case 'arrowright': e.preventDefault(); movePlayer('E'); break;
        case 'w': turnPlayer('N'); break;
        case 's': turnPlayer('S'); break;
        case 'a': turnPlayer('W'); break;
        case 'd': turnPlayer('E'); break;
        case ' ': e.preventDefault(); shootArrow(); break;
        case 'e': case 'enter': case 'p': e.preventDefault(); pickupGold(); break;
        case 'r': handleRestart(); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState?.mode, gameState?.status, movePlayer, turnPlayer, shootArrow, pickupGold, handleRestart]);

  // Keyboard for Sim controls
  useEffect(() => {
    if (gameState?.mode !== 'SIMULATION') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'p') setSimPaused(p => !p);
      if (e.key === 's' && simPaused) stepSim();
      if (e.key === 'r') handleRestart();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState?.mode, simPaused, handleRestart]);

  // Sim Loop
  const stepSim = useCallback(() => {
    if (!gameState || gameState.status !== 'PLAYING' || gameState.mode !== 'SIMULATION') return;

    if (!agentRef.current) {
      if (agentType === 'RANDOM') agentRef.current = new RandomAgent();
      else if (agentType === 'GREEDY') agentRef.current = new GreedySafeAgent(addLog);
      else if (agentType === 'LOGICAL') agentRef.current = new LogicalAgent(addLog);
    }

    const action = agentRef.current!.nextAction(gameState);

    if (action.type === 'CLIMB') {
      climbOut(true);
    } else if (action.type === 'PICKUP') {
      pickupGold();
    } else if (action.type === 'SHOOT' && action.direction) {
      if (gameState.facing !== action.direction) {
        // Agent needs to turn first
        setGameState(prev => prev ? { ...prev, facing: action.direction! } : prev);
        setTimeout(() => shootArrow(), 50); // Shoot after turn slightly delayed
      } else {
        shootArrow();
      }
    } else if (action.type === 'MOVE' && action.direction) {
      movePlayer(action.direction);
    }
  }, [gameState, agentType, climbOut, pickupGold, movePlayer, shootArrow, addLog, setGameState]);

  const handleAIHelp = useCallback(() => {
    if (!gameState || gameState.status !== 'PLAYING') return;
    const helperAgent = new LogicalAgent(addLog);
    helperAgent.bootstrapKB(gameState);

    const action = helperAgent.nextAction(gameState);
    addLog(`🤖 AI Help determined action: ${action.type}${action.direction ? ' ' + action.direction : ''}`, 'info');

    if (action.type === 'CLIMB') {
      climbOut(false);
    } else if (action.type === 'PICKUP') {
      pickupGold();
    } else if (action.type === 'SHOOT' && action.direction) {
      if (gameState.facing !== action.direction) {
        setGameState(prev => prev ? { ...prev, facing: action.direction! } : prev);
      } else {
        shootArrow();
      }
    } else if (action.type === 'MOVE' && action.direction) {
      movePlayer(action.direction);
    }
  }, [gameState, addLog, climbOut, pickupGold, movePlayer, shootArrow, setGameState]);

  const stepRef = useRef(stepSim);
  useEffect(() => {
    stepRef.current = stepSim;
  }, [stepSim]);

  useEffect(() => {
    let interval: any;
    if (gameState?.mode === 'SIMULATION' && !simPaused && gameState.status === 'PLAYING') {
      interval = setInterval(() => {
        stepRef.current();
      }, speedMs);
    }
    return () => clearInterval(interval);
  }, [gameState?.mode, simPaused, gameState?.status, speedMs]);

  if (!gameState) return <div style={{ color: 'white' }}>Loading...</div>;

  const getAgentKb = () => {
    if (gameState.mode === 'SIMULATION' && agentRef.current && (agentType === 'LOGICAL' || agentType === 'GREEDY')) {
      return (agentRef.current as LogicalAgent).kb;
    }
    return null;
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(250px, 1fr) 2fr minmax(280px, 1fr)',
      height: '100vh',
      gap: '10px',
      padding: '10px',
      boxSizing: 'border-box',
      overflow: 'hidden',
      color: '#eaeaea'
    }}>
      <style>{`
        @media (max-width: 900px) {
          div[style*="gridTemplateColumns"] {
            grid-template-columns: 1fr !important;
            grid-template-rows: auto auto minmax(300px, 1fr) !important;
            height: auto !important;
          }
        }
      `}</style>

      {/* LEFT PANEL */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <StatsPanel
          gameState={gameState}
          onRestart={handleRestart}
          onClimbOut={() => climbOut(false)}
          openSettings={() => setIsSettingsOpen(true)}
          openHowToPlay={() => setIsHowToPlayOpen(true)}
          onForfeit={forfeitGame}
          onAIHelp={handleAIHelp}
        />

        {gameMode === 'SIMULATION' && (
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 15px 0', color: 'var(--safe-cyan)', fontSize: '1.2rem' }}>⚡ Sim Controls</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <button style={{ flex: 1, borderColor: simPaused ? 'var(--safe-cyan)' : 'var(--accent-gold)', color: simPaused ? 'var(--safe-cyan)' : 'var(--accent-gold)' }} onClick={() => setSimPaused(p => !p)}>
                {simPaused ? '▶ Play' : '⏸ Pause'}
              </button>
              <button style={{ flex: 1 }} onClick={stepSim} disabled={!simPaused || gameState.status !== 'PLAYING'}>
                ⏭ Step
              </button>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px' }}>
              <p>Type: {agentType}</p>
              <p>Speed: {speedMs}ms</p>
              <p>Shortcuts: P (pause), S (step)</p>
            </div>
          </div>
        )}
      </div>

      {/* CENTER PANEL */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <GridMap
            gameState={gameState}
            getCellData={getCellData}
            simMode={gameState.mode === 'SIMULATION' || gameState.status !== 'PLAYING'}
            agentKb={getAgentKb()}
          />
          <GameOverModal
            status={gameState.status}
            score={gameState.score}
            onRestart={handleRestart}
          />
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <LogPanel logs={logs} />
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        gameMode={gameMode} setGameMode={setGameMode}
        gridSize={gridSize} setGridSize={setGridSize}
        wumpusCount={wumpusCount} setWumpusCount={setWumpusCount}
        pitCount={pitCount} setPitCount={setPitCount}
        goldCount={goldCount} setGoldCount={setGoldCount}
        showPerceptIcons={showPerceptIcons} setShowPerceptIcons={setShowPerceptIcons}
        arrows={arrows} setArrows={setArrows}
        agentType={agentType} setAgentType={setAgentType}
        speedMs={speedMs} setSpeedMs={setSpeedMs}
        onRestart={handleRestart}
      />
      
      <HowToPlayModal 
        isOpen={isHowToPlayOpen} 
        onClose={() => setIsHowToPlayOpen(false)} 
      />
    </div>
  );
};
