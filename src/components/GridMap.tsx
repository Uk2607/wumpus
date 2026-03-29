import React from 'react';
import { GameState, Position } from '../game/types';
import { Cell } from './Cell';

interface Props {
  gameState: GameState;
  getCellData: (r: number, c: number) => any;
  simMode: boolean;
  agentKb?: any; // To color code the agent's safe/danger borders
}

export const GridMap: React.FC<Props> = ({ gameState, getCellData, simMode, agentKb }) => {
  const size = gameState.gridSize;

  return (
    <div
      className="glass-panel"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${size}, 1fr)`,
        gridTemplateRows: `repeat(${size}, 1fr)`,
        gap: '6px',
        width: '100%',
        maxWidth: '600px',
        margin: '0 auto',
        padding: '16px',
      }}
    >
      {Array.from({ length: size }).map((_, r) =>
        Array.from({ length: size }).map((_, c) => {
          const data = getCellData(r, c);
          if (simMode) {
            if (agentKb) {
              data.knownSafe = agentKb.safe?.[r]?.[c];
              data.knownDanger = agentKb.knownPit?.[r]?.[c] || agentKb.knownWumpus?.[r]?.[c];
              data.uncertain = (agentKb.possiblePit?.[r]?.[c] || agentKb.possibleWumpus?.[r]?.[c]) && !data.knownDanger && !data.knownSafe;
            }
            // Reveal everything
            data.hasPit = gameState.pits.some((p: Position) => p.r === r && p.c === c);
            data.hasWumpus = gameState.wumpuses.some(w => w.alive && w.r === r && w.c === c);
            data.hasGold = gameState.golds.some(g => !g.collected && g.r === r && g.c === c);
          }

          return (
            <Cell
              key={`${r}-${c}`}
              data={data}
              isPlayerHere={gameState.playerPos.r === r && gameState.playerPos.c === c}
              facing={gameState.facing}
              simMode={simMode}
              isOrigin={r === 0 && c === 0}
              allGoldCollected={gameState.golds.every(g => g.collected)}
            />
          );
        })
      )}
    </div>
  );
};
