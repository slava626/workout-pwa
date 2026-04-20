'use client';

import { formatElapsed } from '@/hooks/useTimer';

interface Props {
  elapsed: number;
  running: boolean;
  onPause: () => void;
  onResume: () => void;
  onRestart: () => void;
  onEnd: () => void;
}

export default function TimerBar({ elapsed, running, onPause, onResume, onRestart, onEnd }: Props) {
  return (
    <div className="bg-gray-900 border-b border-gray-800">
      {/* Big timer display */}
      <div className="flex flex-col items-center justify-center pt-6 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <span className={[
            'w-3 h-3 rounded-full flex-shrink-0',
            running ? 'bg-green-400 animate-pulse' : 'bg-yellow-400',
          ].join(' ')} />
          <span className="text-white font-mono text-7xl font-bold tabular-nums tracking-tight">
            {formatElapsed(elapsed)}
          </span>
        </div>
        <span className="text-gray-500 text-xs uppercase tracking-widest">
          {running ? 'active' : 'paused'}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 px-4 pb-5">
        {/* Pause / Resume */}
        <button
          onClick={running ? onPause : onResume}
          className={[
            'flex-1 py-3 rounded-2xl font-semibold text-base transition-colors',
            running
              ? 'bg-yellow-500/20 text-yellow-300 active:bg-yellow-500/30'
              : 'bg-green-500/20 text-green-300 active:bg-green-500/30',
          ].join(' ')}
        >
          {running ? 'Pause' : 'Resume'}
        </button>

        {/* Restart — only when paused */}
        {!running && (
          <button
            onClick={onRestart}
            className="flex-1 py-3 rounded-2xl font-semibold text-base bg-gray-700/60 text-gray-300 active:bg-gray-700 transition-colors"
          >
            Restart Timer
          </button>
        )}

        {/* End Workout */}
        <button
          onClick={onEnd}
          className="flex-1 py-3 rounded-2xl font-semibold text-base bg-red-500/15 text-red-400 active:bg-red-500/25 transition-colors"
        >
          End Workout
        </button>
      </div>
    </div>
  );
}
