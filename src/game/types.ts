export type Position = { r: number; c: number };
export type Direction = 'N' | 'E' | 'S' | 'W';

export interface GameState {
  gridSize: number;
  playerPos: Position;
  facing: Direction;
  arrows: number;
  initialArrows: number;
  score: number;
  status: 'PLAYING' | 'WON' | 'LOST' | 'FORFEITED';
  mode: 'MANUAL' | 'SIMULATION';
  wumpuses: { r: number; c: number; alive: boolean }[];
  golds: { r: number; c: number; collected: boolean }[];
  pits: Position[];
  visited: boolean[][];
  movesMade: number;
}

export interface CellData {
  hasPit: boolean;
  hasWumpus: boolean;
  hasGold: boolean;
  breeze: boolean;
  stench: boolean;
  glitter: boolean;
  visited: boolean;
  // Used by AI
  knownSafe: boolean;
  knownDanger: boolean;
  uncertain: boolean;
}

export type AgentType = 'RANDOM' | 'LOGICAL' | 'GREEDY';

export interface SimSettings {
  agentType: AgentType;
  speedMs: number;
  isPaused: boolean;
  stepCount: number;
}
