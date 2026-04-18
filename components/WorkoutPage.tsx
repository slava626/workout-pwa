'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Program, WorkoutDay } from '@/types/workout';
import WeekCalendar from './WeekCalendar';
import WorkoutView from './WorkoutView';
import TimerBar from './TimerBar';
import { useTimer } from '@/hooks/useTimer';

interface Props {
  user: string;
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function nearestWorkoutDay(program: Program, from: string): string | null {
  const allDates = program.weeks.flatMap((w) => w.days.map((d) => d.date)).sort();
  if (allDates.includes(from)) return from;
  const upcoming = allDates.find((d) => d >= from);
  return upcoming ?? allDates[allDates.length - 1] ?? null;
}

export default function WorkoutPage({ user }: Props) {
  const [program, setProgram] = useState<Program | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr());
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const timer = useTimer();

  useEffect(() => {
    fetch(`/workouts/${user}/program.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`No program found for ${user}`);
        return r.json() as Promise<Program>;
      })
      .then((p) => {
        setProgram(p);
        const nearest = nearestWorkoutDay(p, todayStr());
        if (nearest) setSelectedDate(nearest);
      })
      .catch((e) => setError(e.message));
  }, [user]);

  // Acquire / release wake lock with timer running state
  useEffect(() => {
    if (!timer.started) return;

    async function acquireWakeLock() {
      if ('wakeLock' in navigator && timer.running) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        } catch {
          // wake lock not available — silently continue
        }
      }
    }

    async function releaseWakeLock() {
      if (wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    }

    if (timer.running) {
      acquireWakeLock();
    } else {
      releaseWakeLock();
    }

    return () => { releaseWakeLock(); };
  }, [timer.running, timer.started]);

  // Re-acquire wake lock when app comes back to foreground
  useEffect(() => {
    if (!timer.started || !timer.running) return;
    const handler = async () => {
      if (document.visibilityState === 'visible' && !wakeLockRef.current) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        } catch { /* ignore */ }
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [timer.started, timer.running]);

  const selectedWorkout: WorkoutDay | null =
    program?.weeks.flatMap((w) => w.days).find((d) => d.date === selectedDate) ?? null;

  const allDays = program?.weeks.flatMap((w) =>
    w.days.map((d) => ({ date: d.date, day: d.day }))
  ) ?? [];

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-800">
        <Link href="/" className="text-gray-400 text-sm active:text-white transition-colors">
          ← Back
        </Link>
        <h1 className="text-white font-semibold capitalize">{user}</h1>
        <div className="w-10" />
      </header>

      {/* Timer bar — visible once workout started */}
      {timer.started && (
        <TimerBar
          elapsed={timer.elapsed}
          running={timer.running}
          onPause={timer.pause}
          onResume={timer.resume}
        />
      )}

      {/* Week calendar */}
      {program && (
        <WeekCalendar
          allDays={allDays}
          selectedDate={selectedDate}
          onSelect={setSelectedDate}
        />
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {error && (
          <div className="flex items-center justify-center h-40 text-gray-500 text-sm px-6 text-center">
            {error}
          </div>
        )}
        {!program && !error && (
          <div className="flex items-center justify-center h-40 text-gray-500 text-sm">
            Loading…
          </div>
        )}
        {program && !selectedWorkout && (
          <div className="flex items-center justify-center h-40 text-gray-500 text-sm px-6 text-center">
            No workout scheduled for this day.
          </div>
        )}
        {selectedWorkout && (
          <WorkoutView
            workout={selectedWorkout}
            user={user}
            workoutStarted={timer.started}
            onStartWorkout={timer.start}
          />
        )}
      </div>
    </div>
  );
}
