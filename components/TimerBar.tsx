'use client';

import { formatElapsed } from '@/hooks/useTimer';

interface Props {
  elapsed: number;
  running: boolean;
  onPause: () => void;
  onResume: () => void;
}

export default function TimerBar({ elapsed, running, onPause, onResume }: Props) {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
      <div className="flex items-center gap-2">
        {/* Pulse dot */}
        <span className={['w-2 h-2 rounded-full', running ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'].join(' ')} />
        <span className="text-white font-mono text-xl font-semibold tabular-nums">
          {formatElapsed(elapsed)}
        </span>
        <span className="text-gray-500 text-xs">{running ? 'active' : 'paused'}</span>
      </div>

      <button
        onClick={running ? onPause : onResume}
        className={[
          'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
          running
            ? 'bg-yellow-500/20 text-yellow-300 active:bg-yellow-500/30'
            : 'bg-green-500/20 text-green-300 active:bg-green-500/30',
        ].join(' ')}
      >
        {running ? 'Pause' : 'Resume'}
      </button>
    </div>
  );
}
