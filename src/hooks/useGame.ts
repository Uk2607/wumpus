import { useState, useCallback } from 'react';
import type { GameState, Direction, Position, CellData } from '../game/types';
import { generateSolvableMap } from '../game/mapGenerator';
import { audio } from '../game/audioEngine';

export interface GameLog {
  id: number;
  message: string;
  type: 'info' | 'percept' | 'danger' | 'success';
}

export function useGame() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [logs, setLogs] = useState<GameLog[]>([]);

  const addLog = useCallback((message: string, type: 'info' | 'percept' | 'danger' | 'success' = 'info') => {
    setLogs(prev => [...prev.slice(-49), { id: Date.now() + Math.random(), message, type }]); // Keep last 50 logs
  }, []);

  const initGame = useCallback((
    size: number = 6, 
    initialArrows: number = 3, 
    mode: 'MANUAL' | 'SIMULATION' = 'MANUAL',
    wumpusCount: number = 1,
    pitCount: number = 4,
    goldCount: number = 1
  ) => {
    const { wumpuses, pits, golds } = generateSolvableMap(size, wumpusCount, pitCount, goldCount);
    
    const visited = Array.from({ length: size }, () => Array(size).fill(false));
    visited[0][0] = true; // Start cell is always visited

    const newState: GameState = {
      gridSize: size,
      playerPos: { r: 0, c: 0 },
      facing: 'E',
      arrows: initialArrows,
      initialArrows,
      score: 0,
      status: 'PLAYING',
      mode,
      wumpuses: wumpuses.map(w => ({ ...w, alive: true })),
      golds: golds.map(g => ({ ...g, collected: false })),
      pits,
      visited,
      movesMade: 0
    };
    
    setGameState(newState);
    setLogs([{ id: Date.now() + Math.random(), message: 'Entered the dungeon. Find all the gold and escape.', type: 'info' }]);
    audio.init();
    checkPercepts(newState);
  }, [addLog]);

  const checkPercepts = (state: GameState, currentPos?: Position) => {
    const pos = currentPos || state.playerPos;
    const { r, c } = pos;
    const size = state.gridSize;
    let breeze = false;
    let stench = false;
    
    // Check neighbors for pits/wumpus
    const getNeighbors = (r: number, c: number) => {
      const neighbors = [];
      if (r > 0) neighbors.push({ r: r - 1, c });
      if (r < size - 1) neighbors.push({ r: r + 1, c });
      if (c > 0) neighbors.push({ r, c: c - 1 });
      if (c < size - 1) neighbors.push({ r, c: c + 1 });
      return neighbors;
    };

    const neighbors = getNeighbors(r, c);
    for (const n of neighbors) {
      if (state.pits.some(p => p.r === n.r && p.c === n.c)) breeze = true;
      if (state.wumpuses.some(w => w.r === n.r && w.c === n.c && w.alive)) stench = true;
    }

    if (breeze) addLog("💨 You feel a breeze...", 'percept');
    if (stench) addLog("🤢 You smell something terrible...", 'percept');
    if (state.golds.some(g => g.r === r && g.c === c && !g.collected)) {
      addLog("✨ Something glitters here!", 'success');
    }
  };

  const getCellData = useCallback((r: number, c: number): CellData => {
    if (!gameState) return {} as CellData;
    const hasPit = gameState.pits.some(p => p.r === r && p.c === c);
    const hasWumpus = gameState.wumpuses.some(w => w.r === r && w.c === c && w.alive);
    const hasGold = gameState.golds.some(g => g.r === r && g.c === c && !g.collected);
    
    const size = gameState.gridSize;
    let breeze = false;
    let stench = false;
    
    const neighbors = [];
    if (r > 0) neighbors.push({ r: r - 1, c });
    if (r < size - 1) neighbors.push({ r: r + 1, c });
    if (c > 0) neighbors.push({ r, c: c - 1 });
    if (c < size - 1) neighbors.push({ r, c: c + 1 });
    
    for (const n of neighbors) {
      if (gameState.pits.some(p => p.r === n.r && p.c === n.c)) breeze = true;
      if (gameState.wumpuses.some(w => w.r === n.r && w.c === n.c && w.alive)) stench = true;
    }

    return {
      hasPit,
      hasWumpus,
      hasGold,
      breeze,
      stench,
      glitter: hasGold,
      visited: gameState.visited[r][c],
      knownSafe: false,
      knownDanger: false,
      uncertain: false
    };
  }, [gameState]);

  const turnPlayer = useCallback((dir: Direction) => {
    if (!gameState || gameState.status !== 'PLAYING') return;
    setGameState(prev => {
      if (!prev) return prev;
      return { ...prev, facing: dir };
    });
  }, [gameState]);

  const movePlayer = useCallback((dir: Direction) => {
    if (!gameState || gameState.status !== 'PLAYING') return;

    setGameState(prev => {
      if (!prev) return prev;
      
      const nextState = { ...prev };
      nextState.facing = dir;
      
      let nextR = nextState.playerPos.r;
      let nextC = nextState.playerPos.c;
      
      if (dir === 'N') nextR--;
      else if (dir === 'S') nextR++;
      else if (dir === 'E') nextC++;
      else if (dir === 'W') nextC--;
      
      // Bump wall
      if (nextR < 0 || nextR >= nextState.gridSize || nextC < 0 || nextC >= nextState.gridSize) {
        addLog("💥 BUMP! You walked into a wall.", 'danger');
        // nextState.score -= 10;
        return nextState;
      }
      
      // Valid move
      nextState.playerPos = { r: nextR, c: nextC };
      nextState.visited = nextState.visited.map((row, i) => 
        row.map((val, j) => (i === nextR && j === nextC ? true : val))
      );
      nextState.movesMade++;
      nextState.score -= 10;
      audio.playFootstep();

        // Check death:
      const pit = nextState.pits.some(p => p.r === nextR && p.c === nextC);
      const wumpus = nextState.wumpuses.some(w => w.r === nextR && w.c === nextC && w.alive);
      
      if (pit || wumpus) {
        nextState.status = 'LOST';
        nextState.score -= 1000;
        addLog(pit ? "🕳️ You fell into a pit!" : "💀 The Wumpus ate you!", 'danger');
        audio.playDeath();
      } else {
        // Percepts
        setTimeout(() => checkPercepts(nextState, nextState.playerPos), 10);
      }

      return nextState;
    });
  }, [gameState, addLog]);

  const pickupGold = useCallback(() => {
    if (!gameState || gameState.status !== 'PLAYING') return;

    setGameState(prev => {
      if (!prev) return prev;
      const nextState = { ...prev };
      const goldIndex = nextState.golds.findIndex(g => g.r === nextState.playerPos.r && g.c === nextState.playerPos.c && !g.collected);
      if (goldIndex !== -1) {
        nextState.golds = [...nextState.golds];
        nextState.golds[goldIndex] = { ...nextState.golds[goldIndex], collected: true };
        addLog("🪙 You picked up the Gold!", 'success');
        audio.playGoldPickup();
      } else {
        addLog("There is no gold here to pick up.", 'info');
      }
      return nextState;
    });
  }, [gameState, addLog]);

  const shootArrow = useCallback((customDir?: Direction) => {
    if (!gameState || gameState.status !== 'PLAYING' || gameState.arrows <= 0) return;

    setGameState(prev => {
      if (!prev) return prev;
      const nextState = { ...prev };
      nextState.arrows--;
      nextState.score -= 100;
      audio.playArrowFire();

      let hitRow = nextState.playerPos.r;
      let hitCol = nextState.playerPos.c;
      const shootDir = customDir || nextState.facing;

      // Find wumpus in the exactly adjacent cell in the line of sight
      let hitIndex = -1;

      nextState.wumpuses.forEach((w, idx) => {
        if (!w.alive) return;
        let isHit = false;
        
        // Exactly 1 cell distance
        if (shootDir === 'N' && hitCol === w.c && hitRow - w.r === 1) isHit = true;
        if (shootDir === 'S' && hitCol === w.c && w.r - hitRow === 1) isHit = true;
        if (shootDir === 'E' && hitRow === w.r && w.c - hitCol === 1) isHit = true;
        if (shootDir === 'W' && hitRow === w.r && hitCol - w.c === 1) isHit = true;

        if (isHit) {
          hitIndex = idx;
          nextState.score += 1000;
        }
      });

      if (hitIndex !== -1) {
        nextState.wumpuses = [...nextState.wumpuses];
        nextState.wumpuses[hitIndex] = { ...nextState.wumpuses[hitIndex], alive: false };
        addLog("💀 WUMPUS SLAIN! You hear a terrible scream.", 'success');
        audio.playWumpusScream();
      } else {
        addLog("Thud... The arrow hit nothing but wall.", 'info');
      }

      return nextState;
    });
  }, [gameState, addLog]);

  const climbOut = useCallback((fromAgent: boolean = false) => {
    if (!gameState || gameState.status !== 'PLAYING') return;

    const allGoldsCollected = gameState.golds.every(g => g.collected);

    if (gameState.playerPos.r === 0 && gameState.playerPos.c === 0 && allGoldsCollected) {
      setGameState(prev => {
        if (!prev) return prev;
        const nextState = { ...prev, status: 'WON' as const, score: prev.score + 1000 };
        addLog("🏆 You climbed out with all the gold! VICTORY!", 'success');
        audio.playVictory();
        return nextState;
      });
    } else {
      if(!fromAgent) addLog(allGoldsCollected ? "You must be at the entrance to climb out!" : "You need to collect ALL the gold before climbing out!", 'danger');
    }
  }, [gameState, addLog]);

  const forfeitGame = useCallback(() => {
    if (!gameState || gameState.status !== 'PLAYING') return;
    setGameState(prev => {
      if (!prev) return prev;
      addLog("🏳️ You forfeited the match.", 'danger');
      return { ...prev, status: 'FORFEITED' };
    });
  }, [gameState, addLog]);

  return {
    gameState,
    logs,
    initGame,
    movePlayer,
    turnPlayer,
    shootArrow,
    pickupGold,
    climbOut,
    forfeitGame,
    getCellData,
    addLog,
    setGameState
  };
}
