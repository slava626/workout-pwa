'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Section } from '@/types/workout';
import { SectionInterval, formatSeconds, getHiitIntervals, getHiitTotalDurationSeconds } from '@/lib/sectionTiming';

interface Props {
  section: Section;
  workoutStarted: boolean;
  onActiveRowChange: (rowId: string | null) => void;
}

type Phase =
  | { kind: 'idle'; label: string; detail: string; remaining: number; currentRowId: null }
  | { kind: 'countdown'; label: string; detail: string; remaining: number; currentRowId: null }
  | { kind: 'work'; label: string; detail: string; remaining: number; currentRowId: string }
  | { kind: 'rest'; label: string; detail: string; remaining: number; currentRowId: null }
  | { kind: 'complete'; label: string; detail: string; remaining: number; currentRowId: null };

function getPhase(section: Section, intervals: SectionInterval[], elapsedMs: number, started: boolean): Phase {
  const countdown = section.countdown && section.countdown > 0 ? section.countdown : 0;
  const work = section.work && section.work > 0 ? section.work : 0;
  const rest = section.rest && section.rest > 0 ? section.rest : 0;

  if (!started) {
    return {
      kind: 'idle',
      label: 'HIIT Ready',
      detail: `${intervals.length} interval${intervals.length === 1 ? '' : 's'}`,
      remaining: countdown || work,
      currentRowId: null,
    };
  }

  let cursor = 0;
  const elapsedSec = Math.floor(elapsedMs / 1000);

  if (countdown > 0) {
    if (elapsedSec < countdown) {
      return {
        kind: 'countdown',
        label: 'Get Ready',
        detail: 'Starting soon',
        remaining: countdown - elapsedSec,
        currentRowId: null,
      };
    }
    cursor += countdown;
  }

  for (let i = 0; i < intervals.length; i++) {
    const interval = intervals[i];
    const roundPrefix = interval.round > 1 ? `Round ${interval.round} · ` : '';

    if (work > 0) {
      if (elapsedSec < cursor + work) {
        return {
          kind: 'work',
          label: `${roundPrefix}${interval.movement.name}`,
          detail: 'Work',
          remaining: (cursor + work) - elapsedSec,
          currentRowId: interval.rowId,
        };
      }
      cursor += work;
    }

    if (rest > 0 && i < intervals.length - 1) {
      if (elapsedSec < cursor + rest) {
        return {
          kind: 'rest',
          label: 'Rest',
          detail: `Next: ${intervals[i + 1].movement.name}`,
          remaining: (cursor + rest) - elapsedSec,
          currentRowId: null,
        };
      }
      cursor += rest;
    }
  }

  return {
    kind: 'complete',
    label: 'HIIT Complete',
    detail: `${intervals.length} interval${intervals.length === 1 ? '' : 's'} finished`,
    remaining: 0,
    currentRowId: null,
  };
}

export default function HiitCoach({ section, workoutStarted, onActiveRowChange }: Props) {
  const intervals = useMemo(() => getHiitIntervals(section), [section]);
  const totalDurationSeconds = useMemo(() => getHiitTotalDurationSeconds(section), [section]);
  const countdown = section.countdown && section.countdown > 0 ? section.countdown : 0;
  const work = section.work && section.work > 0 ? section.work : 0;
  const rest = section.rest && section.rest > 0 ? section.rest : 0;

  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const startedAtRef = useRef<number | null>(null);
  const accumulatedRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    const totalDurationMs = totalDurationSeconds * 1000;
    const id = window.setInterval(() => {
      const base = startedAtRef.current ?? Date.now();
      const nextElapsed = accumulatedRef.current + (Date.now() - base);

      if (totalDurationMs > 0 && nextElapsed >= totalDurationMs) {
        accumulatedRef.current = totalDurationMs;
        startedAtRef.current = null;
        setElapsed(totalDurationMs);
        setRunning(false);
        return;
      }

      setElapsed(nextElapsed);
    }, 250);
    return () => window.clearInterval(id);
  }, [running, totalDurationSeconds]);

  const start = useCallback(() => {
    startedAtRef.current = Date.now();
    setElapsed(0);
    setStarted(true);
    setRunning(true);
  }, []);

  const pause = useCallback(() => {
    if (startedAtRef.current) {
      accumulatedRef.current += Date.now() - startedAtRef.current;
      startedAtRef.current = null;
    }
    setRunning(false);
  }, []);

  const resume = useCallback(() => {
    startedAtRef.current = Date.now();
    setRunning(true);
  }, []);

  const restart = useCallback(() => {
    accumulatedRef.current = 0;
    startedAtRef.current = Date.now();
    setElapsed(0);
    setStarted(true);
    setRunning(true);
  }, []);

  const phase = useMemo(() => getPhase(section, intervals, elapsed, started), [section, intervals, elapsed, started]);

  useEffect(() => {
    onActiveRowChange(phase.currentRowId);
  }, [onActiveRowChange, phase.currentRowId]);

  if (!intervals.length || !work) return null;

  const progress = totalDurationSeconds > 0
    ? Math.min((elapsed / 1000) / totalDurationSeconds, 1)
    : 0;

  return (
    <div className="mx-4 mt-4 rounded-2xl border border-fuchsia-500/30 bg-fuchsia-500/10 overflow-hidden">
      <div className="px-4 py-3 border-b border-fuchsia-500/20">
        <div className="text-fuchsia-200 text-xs font-semibold uppercase tracking-[0.2em]">
          HIIT Coach
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-white text-2xl font-bold leading-tight">{phase.label}</div>
            <div className="text-fuchsia-100/70 text-sm mt-1">{phase.detail}</div>
          </div>
          <div className="text-right">
            <div className="text-white font-mono text-4xl font-bold tabular-nums">
              {formatSeconds(Math.max(phase.remaining, 0))}
            </div>
            <div className="text-fuchsia-100/60 text-xs uppercase tracking-widest mt-1">
              {phase.kind === 'work' ? 'work' : phase.kind === 'rest' ? 'rest' : phase.kind === 'countdown' ? 'prep' : phase.kind}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-fuchsia-300 transition-[width] duration-300"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-fuchsia-100/70 uppercase tracking-widest">
            {countdown > 0 && <span>Prep {formatSeconds(countdown)}</span>}
            <span>Work {formatSeconds(work)}</span>
            {rest > 0 && <span>Rest {formatSeconds(rest)}</span>}
            <span>{intervals.length} intervals</span>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          {!started ? (
            <button
              onClick={start}
              disabled={!workoutStarted}
              className={[
                'flex-1 py-3 rounded-2xl font-semibold text-base transition-colors',
                workoutStarted
                  ? 'bg-fuchsia-400/20 text-fuchsia-100 active:bg-fuchsia-400/30'
                  : 'bg-gray-700/60 text-gray-500',
              ].join(' ')}
            >
              {workoutStarted ? 'Start HIIT' : 'Start Workout First'}
            </button>
          ) : (
            <button
              onClick={running ? pause : resume}
              className={[
                'flex-1 py-3 rounded-2xl font-semibold text-base transition-colors',
                running
                  ? 'bg-yellow-500/20 text-yellow-200 active:bg-yellow-500/30'
                  : 'bg-green-500/20 text-green-200 active:bg-green-500/30',
              ].join(' ')}
            >
              {running ? 'Pause HIIT' : 'Resume HIIT'}
            </button>
          )}

          {started && (
            <button
              onClick={restart}
              className="flex-1 py-3 rounded-2xl font-semibold text-base bg-white/10 text-white active:bg-white/15 transition-colors"
            >
              Restart HIIT
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
