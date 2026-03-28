import { Agent, AgentAction } from './AgentModel';
import { GameState, Direction, Position } from '../game/types';

export class LogicalAgent extends Agent {
  public kb: {
    safe: boolean[][];
    knownPit: boolean[][];
    knownWumpus: boolean[][];
    possiblePit: boolean[][];
    possibleWumpus: boolean[][];
    visited: boolean[][];
  } = {
    safe: [], knownPit: [], knownWumpus: [], 
    possiblePit: [], possibleWumpus: [], visited: []
  };
  
  public addLog: (m: string) => void = () => {};
  private steps = 0;
  
  constructor(addLogFn?: (m: string) => void) {
    super();
    if (addLogFn) this.addLog = addLogFn;
  }

  reset() {
    this.kb = {
      safe: [], knownPit: [], knownWumpus: [], 
      possiblePit: [], possibleWumpus: [], visited: []
    };
    this.steps = 0;
  }

  private initKB(size: number) {
    if (this.kb.safe.length === size) return;
    const createMap = (initVal: boolean) => Array.from({ length: size }, () => Array(size).fill(initVal));
    this.kb.safe = createMap(false);
    this.kb.knownPit = createMap(false);
    this.kb.knownWumpus = createMap(false);
    this.kb.possiblePit = createMap(true); // initially anywhere could be pit
    this.kb.possibleWumpus = createMap(true);
    this.kb.visited = createMap(false);
    
    // 0,0 is safe
    this.kb.safe[0][0] = true;
    this.kb.possiblePit[0][0] = false;
    this.kb.possibleWumpus[0][0] = false;
  }

  private getNeighbors(r: number, c: number, size: number) {
    const list: {r: number, c: number, dir: Direction}[] = [];
    if (r > 0) list.push({ r: r - 1, c, dir: 'N' });
    if (r < size - 1) list.push({ r: r + 1, c, dir: 'S' });
    if (c > 0) list.push({ r, c: c - 1, dir: 'W' });
    if (c < size - 1) list.push({ r, c: c + 1, dir: 'E' });
    return list;
  }

  private infer(state: GameState) {
    const size = state.gridSize;
    let madeChanges = true;

    while (madeChanges) {
      madeChanges = false;
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          if (this.kb.visited[i][j]) {
            const hasBreeze = this.detectBreeze(state, i, j);
            const hasStench = this.detectStench(state, i, j);
            const neigh = this.getNeighbors(i, j, size);

            if (!hasBreeze) {
              for (const n of neigh) {
                if (this.kb.possiblePit[n.r][n.c]) {
                  this.kb.possiblePit[n.r][n.c] = false;
                  madeChanges = true;
                }
              }
            } else {
              // breeze means at least one possible pit among unvisited neighbors
              const possiblePitNeigh = neigh.filter(n => this.kb.possiblePit[n.r][n.c] && !this.kb.safe[n.r][n.c]);
              if (possiblePitNeigh.length === 1 && !this.kb.knownPit[possiblePitNeigh[0].r][possiblePitNeigh[0].c]) {
                const pr = possiblePitNeigh[0].r;
                const pc = possiblePitNeigh[0].c;
                this.kb.knownPit[pr][pc] = true;
                this.kb.possiblePit[pr][pc] = true; // it is a pit!
                // Any other possible pit from other sources? This is known now.
                madeChanges = true;
              }
            }

            if (!hasStench) {
              for (const n of neigh) {
                if (this.kb.possibleWumpus[n.r][n.c]) {
                  this.kb.possibleWumpus[n.r][n.c] = false;
                  madeChanges = true;
                }
              }
            } else if (state.wumpuses.some(w => w.alive)) {
              const possibleWumNeigh = neigh.filter(n => this.kb.possibleWumpus[n.r][n.c] && !this.kb.safe[n.r][n.c]);
              if (possibleWumNeigh.length === 1 && !this.kb.knownWumpus[possibleWumNeigh[0].r][possibleWumNeigh[0].c]) {
                this.kb.knownWumpus[possibleWumNeigh[0].r][possibleWumNeigh[0].c] = true;
                madeChanges = true;
              }
            }
          }
          
          // If a cell is neither possible pit nor possible wumpus, it is safe
          if (!this.kb.possiblePit[i][j] && !this.kb.possibleWumpus[i][j] && !this.kb.safe[i][j]) {
            this.kb.safe[i][j] = true;
            madeChanges = true;
          }
        }
      }
    }
  }

  private detectBreeze(state: GameState, r: number, c: number) {
    const neigh = this.getNeighbors(r, c, state.gridSize);
    return neigh.some(n => state.pits.some(p => p.r === n.r && p.c === n.c));
  }

  private detectStench(state: GameState, r: number, c: number) {
    const neigh = this.getNeighbors(r, c, state.gridSize);
    return neigh.some(n => state.wumpuses.some(w => w.r === n.r && w.c === n.c && w.alive));
  }

  // Find shortest path to a target using only SAFE cells (or specific allowed cells)
  private findPath(start: Position, goalPredicate: (r: number, c: number) => boolean, allowedCells: (r: number, c: number) => boolean, size: number) {
    const queue: {r: number, c: number, path: {r: number, c: number, dir: Direction}[]}[] = [];
    queue.push({ r: start.r, c: start.c, path: [] });
    const visited = new Set<string>();
    visited.add(`${start.r},${start.c}`);

    while (queue.length > 0) {
      const curr = queue.shift()!;
      if (goalPredicate(curr.r, curr.c) && (curr.r !== start.r || curr.c !== start.c)) {
        return curr.path;
      }

      for (const n of this.getNeighbors(curr.r, curr.c, size)) {
        const key = `${n.r},${n.c}`;
        if (!visited.has(key) && allowedCells(n.r, n.c)) {
          visited.add(key);
          queue.push({ r: n.r, c: n.c, path: [...curr.path, { r: n.r, c: n.c, dir: n.dir }] });
        }
      }
    }
    return null;
  }

  bootstrapKB(state: GameState) {
    this.initKB(state.gridSize);
    for (let r = 0; r < state.gridSize; r++) {
      for (let c = 0; c < state.gridSize; c++) {
        if (state.visited[r][c]) {
          this.kb.visited[r][c] = true;
          this.kb.safe[r][c] = true;
          this.kb.possiblePit[r][c] = false;
          this.kb.possibleWumpus[r][c] = false;
        }
      }
    }
    this.infer(state);
  }

  nextAction(state: GameState): AgentAction {
    this.steps++;
    this.initKB(state.gridSize);
    const { r, c } = state.playerPos;

    // Update KB with current cell
    this.kb.visited[r][c] = true;
    this.kb.safe[r][c] = true;
    this.kb.possiblePit[r][c] = false;
    this.kb.possibleWumpus[r][c] = false;

    // Climb out if we have all gold and at home
    const allGolds = state.golds.every(g => g.collected);
    if (allGolds && r === 0 && c === 0) {
      this.addLog(`[Step ${this.steps}] Returned to start with gold. Climbing out!`);
      return { type: 'CLIMB' };
    }

    // Pick up gold if we are standing on it
    const goldHere = state.golds.find(g => g.r === r && g.c === c && !g.collected);
    if (goldHere) {
      this.addLog(`[Step ${this.steps}] Found gold at (${r},${c}). Picking it up!`);
      return { type: 'PICKUP' };
    }

    // Infer knowledge
    this.infer(state);

    // Look at percepts 
    const breeze = this.detectBreeze(state, r, c);
    const stench = this.detectStench(state, r, c);
    if (!breeze && !stench) {
      this.addLog(`[Step ${this.steps}] Visited (${r},${c}). No breeze/stench. Neighbors are safe.`);
    } else {
      let msg = `[Step ${this.steps}] Visited (${r},${c}). `;
      if (breeze) msg += "Breeze detected. ";
      if (stench) msg += "Stench detected. ";
      msg += "Updating KB.";
      this.addLog(msg);
    }
    
    // Shoot Wumpus if confident
    if (state.wumpuses.some(w => w.alive) && state.arrows > 0) {
      let knownWumpusPos = null;
      for (let i=0; i<state.gridSize; i++) {
        for (let j=0; j<state.gridSize; j++) {
          if (this.kb.knownWumpus[i][j]) {
            // Check if it's still alive in the actual game state (cheat a bit to avoid shooting dead wumpus if we know it's dead)
            const actualWumpus = state.wumpuses.find(w => w.r === i && w.c === j);
            if (actualWumpus && actualWumpus.alive) {
              knownWumpusPos = {r: i, c: j};
            } else if (actualWumpus && !actualWumpus.alive) {
              // We know it's dead, clear it from KB
              this.kb.knownWumpus[i][j] = false;
            }
          }
        }
      }

      if (knownWumpusPos) {
        // Find direction to shoot. Wumpus must be EXACTLY 1 cell away.
        let dirToShoot: Direction | null = null;
        if (knownWumpusPos.r === r && knownWumpusPos.c - c === 1) dirToShoot = 'E';
        else if (knownWumpusPos.r === r && c - knownWumpusPos.c === 1) dirToShoot = 'W';
        else if (knownWumpusPos.c === c && knownWumpusPos.r - r === 1) dirToShoot = 'S';
        else if (knownWumpusPos.c === c && r - knownWumpusPos.r === 1) dirToShoot = 'N';
        
        if (dirToShoot) {
          // Check if we face this dir
          if (state.facing === dirToShoot) {
             this.addLog(`[Step ${this.steps}] Wumpus MUST be at (${knownWumpusPos.r},${knownWumpusPos.c}). Firing arrow ${dirToShoot}!`);
             return { type: 'SHOOT', direction: dirToShoot };
          } else {
             // We need to face it to shoot. A MOVE action acts as a "move into" but for the sake of Wumpus, 
             // wait, in our game, you press shoot and it shoots in facing dir. Moving rotates you. 
             // In AgentModel we can just return SHOOT and useGame can handle aiming if we pass dir. Let's pass dir to SHOOT.
             this.addLog(`[Step ${this.steps}] Aiming at known Wumpus at (${knownWumpusPos.r},${knownWumpusPos.c}). Firing arrow ${dirToShoot}!`);
             return { type: 'SHOOT', direction: dirToShoot };
          }
        }
      }
    }

    // If we have uncollected gold and know its position, we should path to it.
    // Wait, the agent currently only finds path home if it has ALL gold.
    if (allGolds) {
      const pathHome = this.findPath(
        {r, c}, 
        (tr, tc) => tr === 0 && tc === 0, 
        (tr, tc) => this.kb.safe[tr][tc], 
        state.gridSize
      );
      if (pathHome && pathHome.length > 0) {
        const next = pathHome[0];
        this.addLog(`[Step ${this.steps}] Having all gold. Retreating home via (${next.r},${next.c}).`);
        return { type: 'MOVE', direction: next.dir, r: next.r, c: next.c };
      }
    }

    // 1. Unvisited SAFE cells (frontier)
    const frontierPath = this.findPath(
      {r, c},
      (tr, tc) => this.kb.safe[tr][tc] && !this.kb.visited[tr][tc],
      (tr, tc) => this.kb.safe[tr][tc],
      state.gridSize
    );

    if (frontierPath && frontierPath.length > 0) {
      const next = frontierPath[0];
      this.addLog(`[Step ${this.steps}] Moving to safe frontier towards (${frontierPath[frontierPath.length-1].r},${frontierPath[frontierPath.length-1].c}). Next step is (${next.r},${next.c}).`);
      return { type: 'MOVE', direction: next.dir, r: next.r, c: next.c };
    }

    // 2. No known safe frontier? Risk it. Pick unvisited with lowest risk (just any unvisited neighbor that's not known pit/wumpus)
    const neigh = this.getNeighbors(r, c, state.gridSize);
    const riskyButNotSuicide = neigh.filter(n => !this.kb.visited[n.r][n.c] && !this.kb.knownPit[n.r][n.c] && !this.kb.knownWumpus[n.r][n.c]);
    
    if (riskyButNotSuicide.length > 0) {
      const choice = riskyButNotSuicide[Math.floor(Math.random() * riskyButNotSuicide.length)];
      this.addLog(`[Step ${this.steps}] No guaranteed safe cells. Taking a risk by moving to uncertain (${choice.r},${choice.c}).`);
      return { type: 'MOVE', direction: choice.dir, r: choice.r, c: choice.c };
    }

    // 3. Completely stuck
    this.addLog(`[Step ${this.steps}] Agent found no logical moves. Completely stuck. Randomly wandering...`);
    const valid = neigh.filter(n => !this.kb.knownPit[n.r][n.c] && !this.kb.knownWumpus[n.r][n.c]);
    if (valid.length > 0) {
       const choice = valid[Math.floor(Math.random() * valid.length)];
       return { type: 'MOVE', direction: choice.dir, r: choice.r, c: choice.c };
    }

    const choice = neigh[Math.floor(Math.random() * neigh.length)];
    return { type: 'MOVE', direction: choice.dir, r: choice.r, c: choice.c };
  }
}
