import { Agent, AgentAction } from './AgentModel';
import { GameState, Direction } from '../game/types';

export class RandomAgent extends Agent {
  reset() {}

  nextAction(state: GameState): AgentAction {
    // If we have all gold and are at 0,0 climb out
    const allGolds = state.golds.every(g => g.collected);
    if (allGolds && state.playerPos.r === 0 && state.playerPos.c === 0) {
      return { type: 'CLIMB' };
    }

    // Pick up gold if we are standing on it
    const goldHere = state.golds.find(g => g.r === state.playerPos.r && g.c === state.playerPos.c && !g.collected);
    if (goldHere) {
      return { type: 'PICKUP' };
    }

    const size = state.gridSize;
    const { r, c } = state.playerPos;
    const neighbors: { r: number; c: number; dir: Direction }[] = [];
    
    if (r > 0) neighbors.push({ r: r - 1, c, dir: 'N' });
    if (r < size - 1) neighbors.push({ r: r + 1, c, dir: 'S' });
    if (c > 0) neighbors.push({ r, c: c - 1, dir: 'W' });
    if (c < size - 1) neighbors.push({ r, c: c + 1, dir: 'E' });

    // Prefer unvisited
    let candidates = neighbors.filter(n => !state.visited[n.r][n.c]);
    if (candidates.length === 0) {
      // If all visited, just pick a random valid neighbor
      candidates = neighbors;
    }

    const choice = candidates[Math.floor(Math.random() * candidates.length)];
    return { type: 'MOVE', direction: choice.dir, r: choice.r, c: choice.c };
  }
}
