'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Program, WorkoutDay } from '@/types/workout';
import WeekCalendar from './WeekCalendar';
import WorkoutView from './WorkoutView';

interface Props {
  user: string;
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function nearestWorkoutDay(program: Program, from: string): string | null {
  const allDates = program.weeks.flatMap((w) => w.days.map((d) => d.date)).sort();
  if (allDates.includes(from)) return from;
  // find next upcoming
  const upcoming = allDates.find((d) => d >= from);
  if (upcoming) return upcoming;
  // fallback to last available
  return allDates[allDates.length - 1] ?? null;
}

export default function WorkoutPage({ user }: Props) {
  const [program, setProgram] = useState<Program | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr());

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
          <WorkoutView workout={selectedWorkout} user={user} />
        )}
      </div>
    </div>
  );
}
