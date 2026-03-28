import { GameState, Direction } from '../game/types';

export interface AgentAction {
  type: 'MOVE' | 'SHOOT' | 'CLIMB' | 'PICKUP';
  direction?: Direction;
  r?: number;
  c?: number;
}

export abstract class Agent {
  abstract nextAction(gameState: GameState): AgentAction;
  abstract reset(): void;
}
