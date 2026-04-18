'use client';

import { Section } from '@/types/workout';
import MovementRow from './MovementRow';

interface Props {
  section: Section;
  meta: string;
  checks: Record<string, boolean>;
  notes: Record<string, string>;
  results: Record<string, string>;
  onCheck: (rowId: string, value: boolean) => void;
  onNote: (rowId: string, value: string) => void;
  onResult: (rowId: string, value: string) => void;
}

const SECTION_COLORS: Record<string, string> = {
  warmup: 'text-orange-400',
  wod: 'text-blue-400',
  cashout: 'text-green-400',
};

export default function SectionBlock({ section, meta, checks, notes, results, onCheck, onNote, onResult }: Props) {
  const headingColor = SECTION_COLORS[section.type] ?? 'text-gray-300';
  const rounds = section.rounds && section.rounds > 1 ? section.rounds : 1;

  return (
    <div className="rounded-2xl bg-gray-800 overflow-hidden border border-gray-700">
      <div className="flex items-baseline justify-between px-4 py-3 border-b border-gray-700">
        <span className={`font-semibold text-sm uppercase tracking-wide ${headingColor}`}>
          {section.label}
        </span>
        {meta && <span className="text-gray-400 text-xs">{meta}</span>}
      </div>

      <div className="divide-y divide-gray-700/60">
        {Array.from({ length: rounds }, (_, ri) => (
          <div key={ri}>
            {rounds > 1 && (
              <div className="px-4 py-2 bg-gray-900/50">
                <span className="text-gray-500 text-xs font-semibold uppercase tracking-widest">
                  Round {ri + 1}
                </span>
              </div>
            )}
            <div className="divide-y divide-gray-700/40">
              {section.movements.map((movement) => {
                const rowId = `${movement.id}-r${ri + 1}`;
                return (
                  <MovementRow
                    key={rowId}
                    movement={movement}
                    rowId={rowId}
                    checked={!!checks[rowId]}
                    note={notes[rowId] ?? ''}
                    result={results[rowId] ?? ''}
                    onCheck={onCheck}
                    onNote={onNote}
                    onResult={onResult}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
