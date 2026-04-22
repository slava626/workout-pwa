'use client';

import { Section } from '@/types/workout';
import MovementRow from './MovementRow';

interface Props {
  section: Section;
  meta: string;
  user: string;
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

const EMOM_STYLES = new Set(['emom', 'e2mom', 'e3mom']);

function intervalMinutes(style: string): number {
  if (style === 'e2mom') return 2;
  if (style === 'e3mom') return 3;
  return 1;
}

function parseTotalMinutes(duration: string): number {
  const m = duration.match(/(\d+)/);
  return m ? parseInt(m[1]) : 0;
}

function getSectionSetCount(section: Section): number {
  if (section.sets && section.sets > 1) return section.sets;
  return section.movements.reduce((max, movement) => Math.max(max, movement.sets && movement.sets > 1 ? movement.sets : 1), 1);
}

export default function SectionBlock({ section, meta, user, checks, notes, results, onCheck, onNote, onResult }: Props) {
  const headingColor = SECTION_COLORS[section.type] ?? 'text-gray-300';
  const isEmom = EMOM_STYLES.has(section.style ?? '');

  // ── EMOM / E2MOM / E3MOM layout ────────────────────────────────────────────
  if (isEmom && section.duration) {
    const totalMin = parseTotalMinutes(section.duration);
    const everyN = intervalMinutes(section.style!);
    const totalIntervals = Math.floor(totalMin / everyN);

    return (
      <div className="rounded-2xl bg-gray-800 overflow-hidden border border-gray-700">
        <div className="flex items-baseline justify-between px-4 py-3 border-b border-gray-700">
          <span className={`font-semibold text-sm uppercase tracking-wide ${headingColor}`}>
            {section.label}
          </span>
          {meta && <span className="text-gray-400 text-xs">{meta}</span>}
        </div>
        <div className="divide-y divide-gray-700/60">
          {Array.from({ length: totalIntervals }, (_, i) => {
            const intervalNum = i + 1;
            const movement = section.movements[i % section.movements.length];
            const rowId = `${movement.id}-m${intervalNum}`;
            const minuteStart = (intervalNum - 1) * everyN;
            const minuteEnd = minuteStart + everyN;
            const intervalLabel = everyN === 1
              ? `Minute ${intervalNum}`
              : `${minuteStart}:00 – ${minuteEnd}:00`;
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
                setLabel={intervalLabel}
              />
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
