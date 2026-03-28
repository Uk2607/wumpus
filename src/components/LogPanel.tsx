import React, { useEffect, useRef } from 'react';
import { GameLog } from '../hooks/useGame';

interface Props {
  logs: GameLog[];
}

export const LogPanel: React.FC<Props> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div style={{
      flex: 1,
      minHeight: 0,
      backgroundColor: 'var(--panel-bg, rgba(20, 20, 30, 0.6))',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column',
      padding: '15px',
      overflow: 'hidden',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)'
    }}>
      <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '5px', margin: '0 0 10px 0', color: 'var(--accent-gold)' }}>Game Events</h3>
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
        {logs.map(log => {
          let color = 'inherit';
          if (log.type === 'danger') color = 'var(--danger-red)';
          if (log.type === 'success') color = 'var(--safe-cyan)';
          if (log.type === 'percept') color = 'var(--accent-gold)';

          return (
            <div key={log.id} style={{ color, animation: 'popIn 0.3s ease-out' }}>
              {log.message}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
