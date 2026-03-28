import { Position } from './types';

function randomInt(max: number) {
  return Math.floor(Math.random() * max);
}

function getNeighbors(r: number, c: number, size: number): Position[] {
  const neighbors: Position[] = [];
  if (r > 0) neighbors.push({ r: r - 1, c }); // N
  if (r < size - 1) neighbors.push({ r: r + 1, c }); // S
  if (c > 0) neighbors.push({ r, c: c - 1 }); // W
  if (c < size - 1) neighbors.push({ r, c: c + 1 }); // E
  return neighbors;
}

export function generateSolvableMap(size: number, wumpusCount: number, pitCount: number, goldCount: number): {
  wumpuses: Position[];
  pits: Position[];
  golds: Position[];
} {
  for (let attempt = 0; attempt < 500; attempt++) {
    const wumpuses: Position[] = [];
    const pits: Position[] = [];
    const golds: Position[] = [];

    const isConflict = (r: number, c: number) => {
      return (
        wumpuses.some(w => w.r === r && w.c === c) ||
        pits.some(p => p.r === r && p.c === c) ||
        golds.some(g => g.r === r && g.c === c)
      );
    };

    // 1. Place Wumpuses
    while (wumpuses.length < wumpusCount) {
      const r = randomInt(size);
      const c = randomInt(size);
      if (r === 0 && c === 0) continue;
      if (isConflict(r, c)) continue;
      wumpuses.push({ r, c });
    }

    // 2. Place Pits
    while (pits.length < pitCount) {
      const r = randomInt(size);
      const c = randomInt(size);
      if (r === 0 && c === 0) continue;
      if (isConflict(r, c)) continue;
      pits.push({ r, c });
    }

    // 3. Place Golds
    const isAdjacentToStart = (r: number, c: number) => {
      return (r === 0 && c === 1) || (r === 1 && c === 0) || (r === 0 && c === 0);
    };

    while (golds.length < goldCount) {
      const r = randomInt(size);
      const c = randomInt(size);
      if (isAdjacentToStart(r, c)) continue;
      if (isConflict(r, c)) continue;
      golds.push({ r, c });
    }

    // 4. BFS to check solvability (can we safely reach ALL gold?)
    const visited = new Set<string>();
    const queue: Position[] = [{ r: 0, c: 0 }];
    visited.add('0,0');
    
    let reachableGoldCount = 0;
    const safeCellsReached: Position[] = [{ r: 0, c: 0 }];

    while (queue.length > 0) {
      const curr = queue.shift()!;
      if (golds.some(g => g.r === curr.r && g.c === curr.c)) {
        reachableGoldCount++;
      }
      
      const neighbors = getNeighbors(curr.r, curr.c, size);
      for (const n of neighbors) {
        const key = `${n.r},${n.c}`;
        if (!visited.has(key)) {
          const isPit = pits.some(p => p.r === n.r && p.c === n.c);
          const isWumpus = wumpuses.some(w => w.r === n.r && w.c === n.c);
          
          if (!isPit && !isWumpus) {
            visited.add(key);
            queue.push(n);
            safeCellsReached.push(n);
          }
        }
      }
    }

    if (reachableGoldCount === goldCount) {
      return { wumpuses, pits, golds };
    } else if (attempt === 499) {
      // Fallback: move all unreachable golds to random safe cells
      const finalGolds: Position[] = [];
      const availableSafe = safeCellsReached.filter(cell => !isAdjacentToStart(cell.r, cell.c) && !isConflict(cell.r, cell.c));
      for (let i = 0; i < goldCount; i++) {
        if (i < availableSafe.length) {
          finalGolds.push(availableSafe[i]);
        } else {
          finalGolds.push({ r: 0, c: 0 }); // Absolute worst case, put it at start
        }
      }
      return { wumpuses, pits, golds: finalGolds };
    }
  }

  return { wumpuses: [{ r: 1, c: 1 }], pits: [], golds: [{ r: 0, c: 1 }] };
}
