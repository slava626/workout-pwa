'use client';

import { WorkoutDay } from '@/types/workout';
import { formatElapsed } from '@/hooks/useTimer';

interface Props {
  workout: WorkoutDay;
  elapsed: number;
  checks: Record<string, boolean>;
  notes: Record<string, string>;
  results: Record<string, string>;
  user: string;
}

const SECTION_COLORS: Record<string, string> = {
  warmup: 'text-orange-400',
  wod: 'text-blue-400',
  cashout: 'text-green-400',
};

export default function WorkoutRecap({ workout, elapsed, checks, notes, results, user }: Props) {
  const dateLabel = new Date(workout.date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  const totalChecked = Object.values(checks).filter(Boolean).length;

  return (
    <div className="px-4 py-6 pb-24 flex flex-col gap-6">
      {/* Hero */}
      <div className="text-center py-4">
        <div className="text-5xl mb-3">🏆</div>
        <h2 className="text-white text-2xl font-bold">Workout Complete!</h2>
        <p className="text-gray-400 text-sm mt-1 capitalize">{user} · {dateLabel}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-800 rounded-2xl p-4 text-center border border-gray-700">
          <div className="text-white font-mono text-2xl font-bold">{formatElapsed(elapsed)}</div>
          <div className="text-gray-500 text-xs mt-1">Total Time</div>
        </div>
        <div className="bg-gray-800 rounded-2xl p-4 text-center border border-gray-700">
          <div className="text-white text-2xl font-bold">{totalChecked}</div>
          <div className="text-gray-500 text-xs mt-1">Sets Completed</div>
        </div>
      </div>

      {/* Sections summary */}
      {workout.sections.map((section) => {
        const rounds = section.rounds && section.rounds > 1 ? section.rounds : 1;
        const headingColor = SECTION_COLORS[section.type] ?? 'text-gray-300';

        // Collect rows that have notes or results
        const rows: { name: string; note: string; result: string }[] = [];
        for (let r = 1; r <= rounds; r++) {
          for (const mv of section.movements) {
            const rowId = `${mv.id}-r${r}`;
            const note = notes[rowId] ?? '';
            const result = results[rowId] ?? '';
            if (note || result || rounds > 1) {
              rows.push({
                name: rounds > 1 ? `R${r} · ${mv.name}` : mv.name,
                note,
                result,
              });
            }
          }
        }

        return (
          <div key={section.type} className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700">
            <div className="px-4 py-3 border-b border-gray-700">
              <span className={`font-semibold text-sm uppercase tracking-wide ${headingColor}`}>
                {section.label}
              </span>
            </div>
            <div className="divide-y divide-gray-700/60">
              {rows.length === 0 ? (
                <div className="px-4 py-3 text-gray-500 text-sm">
                  {section.movements.map(mv => mv.name).join(' · ')}
                </div>
              ) : (
                rows.map((row, i) => (
                  <div key={i} className="px-4 py-3">
                    <div className="text-white text-sm font-medium">{row.name}</div>
                    {row.result && (
                      <div className="text-green-400 text-sm mt-0.5">→ {row.result}</div>
                    )}
                    {row.note && (
                      <div className="text-yellow-400 text-xs mt-0.5 italic">{row.note}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
