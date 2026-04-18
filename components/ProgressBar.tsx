'use client';

interface Props {
  completed: number;
  total: number;
}

export default function ProgressBar({ completed, total }: Props) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="px-4 py-2 bg-gray-900 border-b border-gray-800">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-gray-400 text-xs">{completed} / {total} movements</span>
        <span className="text-white text-xs font-semibold">{pct}%</span>
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
