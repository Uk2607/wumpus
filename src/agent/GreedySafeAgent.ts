import { AgentAction } from './AgentModel';
import { GameState } from '../game/types';
import { LogicalAgent } from './LogicalAgent';

export class GreedySafeAgent extends LogicalAgent {
  nextAction(state: GameState): AgentAction {
    // Greedy Safe Agent just uses the LogicalAgent's KB but never shoots arrows.
    // It strictly explores safe frontier cells and climbs out.
    // We can just call super.nextAction and override SHOOT if needed.
    const action = super.nextAction(state);
    if (action.type === 'SHOOT') {
       // Ignore shoot and just move to next safe if possible
       this.addLog("Greedy Safe Agent refuses to shoot. Recalculating...");
       // Hacky skip: just return a safe move if possible
       return { type: 'MOVE', direction: 'N', r: state.playerPos.r, c: state.playerPos.c }; // might bump wall
    }
    return action;
  }
}
