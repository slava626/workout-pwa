'use client';

import { useCallback, useState } from 'react';
import { Section } from '@/types/workout';
import HiitCoach from './HiitCoach';
import MovementRow from './MovementRow';
import { EMOM_STYLES, HIIT_STYLE, getEmomIntervals, getHiitIntervals } from '@/lib/sectionTiming';

interface Props {
  section: Section;
  meta: string;
  user: string;
  workoutStarted: boolean;
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

function getSectionSetCount(section: Section): number {
  if (section.sets && section.sets > 1) return section.sets;
  return section.movements.reduce((max, movement) => Math.max(max, movement.sets && movement.sets > 1 ? movement.sets : 1), 1);
}

export default function SectionBlock({ section, meta, user, workoutStarted, checks, notes, results, onCheck, onNote, onResult }: Props) {
  const headingColor = SECTION_COLORS[section.type] ?? 'text-gray-300';
  const isEmom = EMOM_STYLES.has(section.style ?? '');
  const isHiit = section.style === HIIT_STYLE;
  const [activeHiitRowId, setActiveHiitRowId] = useState<string | null>(null);
  const handleActiveHiitRowChange = useCallback((rowId: string | null) => {
    setActiveHiitRowId(rowId);
  }, []);

  // ── EMOM / E2MOM / E3MOM layout ────────────────────────────────────────────
  if (isEmom && section.duration) {
    const intervals = getEmomIntervals(section);

    return (
      <div className="rounded-2xl bg-gray-800 overflow-hidden border border-gray-700">
        <div className="flex items-baseline justify-between px-4 py-3 border-b border-gray-700">
          <span className={`font-semibold text-sm uppercase tracking-wide ${headingColor}`}>
            {section.label}
          </span>
          {meta && <span className="text-gray-400 text-xs">{meta}</span>}
        </div>
        <div className="divide-y divide-gray-700/60">
          {intervals.map(({ rowId, movement, label }) => (
              <MovementRow
                key={rowId}
                movement={movement}
                rowId={rowId}
                user={user}
                checked={!!checks[rowId]}
                note={notes[rowId] ?? ''}
                result={results[rowId] ?? ''}
                onCheck={onCheck}
                onNote={onNote}
                onResult={onResult}
                setLabel={label}
              />
          ))}
        </div>
      </div>
    );
  }

  if (isHiit) {
    const hiitIntervals = getHiitIntervals(section);

    return (
      <div className="rounded-2xl bg-gray-800 overflow-hidden border border-gray-700">
        <div className="flex items-baseline justify-between px-4 py-3 border-b border-gray-700">
          <span className={`font-semibold text-sm uppercase tracking-wide ${headingColor}`}>
            {section.label}
          </span>
          {meta && <span className="text-gray-400 text-xs">{meta}</span>}
        </div>
        <HiitCoach
          section={section}
          workoutStarted={workoutStarted}
          onActiveRowChange={handleActiveHiitRowChange}
        />
        <div className="divide-y divide-gray-700/60">
          {Array.from({ length: section.rounds && section.rounds > 1 ? section.rounds : 1 }, (_, ri) => {
            const round = ri + 1;
            const intervalsForRound = hiitIntervals.filter((interval) => interval.round === round);
            return (
              <div key={round}>
                {(section.rounds && section.rounds > 1) && (
                  <div className="px-4 py-2 bg-gray-900/50">
                    <span className="text-gray-500 text-xs font-semibold uppercase tracking-widest">
                      Round {round}
                    </span>
                  </div>
                )}
                <div className="divide-y divide-gray-700/40">
                  {intervalsForRound.map((interval) => (
                    <MovementRow
                      key={interval.rowId}
                      movement={interval.movement}
                      rowId={interval.rowId}
                      user={user}
                      checked={!!checks[interval.rowId]}
                      note={notes[interval.rowId] ?? ''}
                      result={results[interval.rowId] ?? ''}
                      active={activeHiitRowId === interval.rowId}
                      onCheck={onCheck}
                      onNote={onNote}
                      onResult={onResult}
                      setLabel={interval.label}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Normal layout ───────────────────────────────────────────────────────────
  const rounds = section.rounds && section.rounds > 1 ? section.rounds : 1;
  const sectionSets = getSectionSetCount(section);
  const useSetGroups = sectionSets > 1;

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
              {useSetGroups ? (
                Array.from({ length: sectionSets }, (_, si) => (
                  <div key={si}>
                    <div className="px-4 py-2 bg-gray-900/50">
                      <span className="text-gray-500 text-xs font-semibold uppercase tracking-widest">
                        Set {si + 1}
                      </span>
                    </div>
                    <div className="divide-y divide-gray-700/40">
                      {section.movements
                        .filter((movement) => {
                          const sets = movement.sets && movement.sets > 1 ? movement.sets : sectionSets;
                          return sets >= si + 1;
                        })
                        .map((movement) => {
                          const rowId = `${movement.id}-r${ri + 1}-s${si + 1}`;
                          return (
                            <MovementRow
                              key={rowId}
                              movement={movement}
                              rowId={rowId}
                              user={user}
                              checked={!!checks[rowId]}
                              note={notes[rowId] ?? ''}
                              result={results[rowId] ?? ''}
                              onCheck={onCheck}
                              onNote={onNote}
                              onResult={onResult}
                              setLabel={rounds > 1 ? `Round ${ri + 1} · Set ${si + 1}` : `Set ${si + 1}`}
                            />
                          );
                        })}
                    </div>
                  </div>
                ))
              ) : (
                section.movements.flatMap((movement) => {
                  const sets = movement.sets && movement.sets > 1 ? movement.sets : 1;
                  if (sets > 1) {
                    return Array.from({ length: sets }, (_, si) => {
                      const rowId = `${movement.id}-r${ri + 1}-s${si + 1}`;
                      return (
                        <MovementRow
                          key={rowId}
                          movement={movement}
                          rowId={rowId}
                          user={user}
                          checked={!!checks[rowId]}
                          note={notes[rowId] ?? ''}
                          result={results[rowId] ?? ''}
                          onCheck={onCheck}
                          onNote={onNote}
                          onResult={onResult}
                          setLabel={`Set ${si + 1} / ${sets}`}
                        />
                      );
                    });
                  }
                  const rowId = `${movement.id}-r${ri + 1}`;
                  return (
                    <MovementRow
                      key={rowId}
                      movement={movement}
                      rowId={rowId}
                      user={user}
                      checked={!!checks[rowId]}
                      note={notes[rowId] ?? ''}
                      result={results[rowId] ?? ''}
                      onCheck={onCheck}
                      onNote={onNote}
                      onResult={onResult}
                    />
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
