'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { Program, WorkoutDay } from '@/types/workout';
import WeekCalendar from './WeekCalendar';
import WorkoutView from './WorkoutView';
import WorkoutRecap from './WorkoutRecap';
import TimerBar from './TimerBar';
import ProgressBar from './ProgressBar';
import CelebrationToast from './CelebrationToast';
import { useTimer } from '@/hooks/useTimer';
import { EMOM_STYLES, HIIT_STYLE, getEmomIntervals, getHiitIntervals } from '@/lib/sectionTiming';

interface Props { user: string; }

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getMovementSetCount(workoutSets: number | undefined, movementSets: number | undefined): number {
  if (movementSets && movementSets > 1) return movementSets;
  if (workoutSets && workoutSets > 1) return workoutSets;
  return 1;
}

function getTotalRows(workout: WorkoutDay): number {
  return workout.sections.reduce((sum, s) => {
    // EMOM sections: each interval = 1 checkable row
    if (EMOM_STYLES.has(s.style ?? '') && s.duration) {
      return sum + getEmomIntervals(s).length;
    }
    if (s.style === HIIT_STYLE) {
      return sum + getHiitIntervals(s).length;
    }
    // Normal sections: rounds × sum(sets per movement)
    const rounds = s.rounds && s.rounds > 1 ? s.rounds : 1;
    return sum + rounds * s.movements.reduce((ms, m) => ms + getMovementSetCount(s.sets, m.sets), 0);
  }, 0);
}

function sessionKey(user: string, date: string) { return `session:${user}:${date}`; }

function loadSession(key: string) {
  if (typeof window === 'undefined') return { checks: {}, notes: {}, results: {} };
  try { return JSON.parse(localStorage.getItem(key) ?? '{}'); } catch { return {}; }
}

function saveSession(key: string, data: object) {
  localStorage.setItem(key, JSON.stringify(data));
}

export default function WorkoutPage({ user }: Props) {
  const [program, setProgram] = useState<Program | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr());
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, string>>({});
  const [celebrationTrigger, setCelebrationTrigger] = useState(0);
  const [isEnded, setIsEnded] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const timer = useTimer();

  // Load program
  useEffect(() => {
    fetch(`/workouts/${user}/program.json`)
      .then((r) => { if (!r.ok) throw new Error(`No program found for ${user}`); return r.json() as Promise<Program>; })
      .then((p) => {
        setProgram(p);
      })
      .catch((e) => setError(e.message));
  }, [user]);

  // Load session state when date/user changes
  useEffect(() => {
    const key = sessionKey(user, selectedDate);
    const s = loadSession(key);
    setChecks(s.checks ?? {});
    setNotes(s.notes ?? {});
    setResults(s.results ?? {});
    setIsEnded(false);
  }, [user, selectedDate]);

  // Wake lock management
  useEffect(() => {
    if (!timer.started) return;
    const acquire = async () => {
      if ('wakeLock' in navigator && timer.running) {
        try { wakeLockRef.current = await navigator.wakeLock.request('screen'); } catch { /* unsupported */ }
      }
    };
    const release = async () => {
      if (wakeLockRef.current) { await wakeLockRef.current.release(); wakeLockRef.current = null; }
    };
    if (timer.running) acquire(); else release();
    return () => { release(); };
  }, [timer.running, timer.started]);

  // Re-acquire wake lock on visibility change
  useEffect(() => {
    if (!timer.started || !timer.running) return;
    const handler = async () => {
      if (document.visibilityState === 'visible' && !wakeLockRef.current) {
        try { wakeLockRef.current = await navigator.wakeLock.request('screen'); } catch { /* ignore */ }
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [timer.started, timer.running]);

  const handleCheck = useCallback((rowId: string, value: boolean) => {
    setChecks((prev) => {
      const next = { ...prev, [rowId]: value };
      const key = sessionKey(user, selectedDate);
      const s = loadSession(key);
      s.checks = next;
      saveSession(key, s);
      return next;
    });
    if (value) setCelebrationTrigger((n) => n + 1);
  }, [user, selectedDate]);

  const handleNote = useCallback((rowId: string, value: string) => {
    setNotes((prev) => {
      const next = { ...prev, [rowId]: value };
      const key = sessionKey(user, selectedDate);
      const s = loadSession(key);
      s.notes = next;
      saveSession(key, s);
      return next;
    });
  }, [user, selectedDate]);

  const handleResult = useCallback((rowId: string, value: string) => {
    setResults((prev) => {
      const next = { ...prev, [rowId]: value };
      const key = sessionKey(user, selectedDate);
      const s = loadSession(key);
      s.results = next;
      saveSession(key, s);
      return next;
    });
  }, [user, selectedDate]);

  const handleEnd = useCallback(() => {
    timer.pause();
    setIsEnded(true);
  }, [timer]);

  // Restart = clear session + fresh timer (keeps workout day selected)
  const handleRestart = useCallback(() => {
    const key = sessionKey(user, selectedDate);
    saveSession(key, { checks: {}, notes: {}, results: {} });
    setChecks({});
    setNotes({});
    setResults({});
    setIsEnded(false);
    timer.restart();
  }, [user, selectedDate, timer]);

  const selectedWorkout = program?.weeks.flatMap((w) => w.days).find((d) => d.date === selectedDate) ?? null;
  const allDays = program?.weeks.flatMap((w) => w.days.map((d) => ({ date: d.date, day: d.day }))) ?? [];
  const totalRows = selectedWorkout ? getTotalRows(selectedWorkout) : 0;
  const completedRows = Object.values(checks).filter(Boolean).length;
  const isComplete = timer.started && totalRows > 0 && completedRows >= totalRows;
  const showRecap = isComplete || isEnded;

  const scrollRef = useRef<HTMLDivElement>(null);

  // Stop timer and scroll to top when workout completes
  useEffect(() => {
    if (isComplete) {
      timer.pause();
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComplete]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header — always visible */}
      <header className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-800 flex-shrink-0">
        <Link href="/" className="text-gray-400 text-sm active:text-white transition-colors">← Back</Link>
        <h1 className="text-white font-semibold capitalize">{user}</h1>
        <div className="w-10" />
      </header>

      {/* Sticky timer + progress — shown once workout started */}
      {timer.started && (
        <div className="flex-shrink-0">
          <TimerBar
            elapsed={timer.elapsed}
            running={timer.running}
            onPause={timer.pause}
            onResume={timer.resume}
            onRestart={handleRestart}
            onEnd={handleEnd}
          />
          <ProgressBar completed={completedRows} total={totalRows} />
        </div>
      )}

      {/* Calendar — hidden once started */}
      {!timer.started && program && (
        <div className="flex-shrink-0">
          <WeekCalendar allDays={allDays} selectedDate={selectedDate} onSelect={setSelectedDate} />
        </div>
      )}

      {/* Scrollable content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {error && (
          <div className="flex items-center justify-center h-40 text-gray-500 text-sm px-6 text-center">{error}</div>
        )}
        {!program && !error && (
          <div className="flex items-center justify-center h-40 text-gray-500 text-sm">Loading…</div>
        )}
        {program && !selectedWorkout && (
          <div className="flex items-center justify-center h-40 text-gray-500 text-sm px-6 text-center">
            No workout scheduled for this day.
          </div>
        )}
        {selectedWorkout && !showRecap && (
          <WorkoutView
            workout={selectedWorkout}
            user={user}
            workoutStarted={timer.started}
            onStartWorkout={timer.start}
            checks={checks}
            notes={notes}
            results={results}
            onCheck={handleCheck}
            onNote={handleNote}
            onResult={handleResult}
          />
        )}
        {selectedWorkout && showRecap && (
          <WorkoutRecap
            workout={selectedWorkout}
            elapsed={timer.elapsed}
            checks={checks}
            notes={notes}
            results={results}
            user={user}
          />
        )}
      </div>

      {/* Celebration overlay */}
      <CelebrationToast trigger={celebrationTrigger} />
    </div>
  );
}
