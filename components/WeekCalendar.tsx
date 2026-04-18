'use client';

import { useState, useEffect } from 'react';

interface DayInfo {
  date: string; // YYYY-MM-DD
  day: string;
}

interface Props {
  allDays: DayInfo[];
  selectedDate: string;
  onSelect: (date: string) => void;
}

function startOfWeek(dateStr: string): Date {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay(); // 0=Sun
  const diff = (day === 0 ? -6 : 1 - day); // shift to Monday
  d.setDate(d.getDate() + diff);
  return d;
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0];
}

const DOW_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function WeekCalendar({ allDays, selectedDate, onSelect }: Props) {
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(selectedDate));

  useEffect(() => {
    setWeekStart(startOfWeek(selectedDate));
  }, [selectedDate]);

  const workoutDates = new Set(allDays.map((d) => d.date));
  const today = new Date().toISOString().split('T')[0];

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(weekStart, i);
    const dateStr = toDateStr(d);
    return {
      label: DOW_SHORT[i],
      dateStr,
      dayNum: d.getDate(),
      hasWorkout: workoutDates.has(dateStr),
      isToday: dateStr === today,
      isSelected: dateStr === selectedDate,
    };
  });

  const prevWeek = () => setWeekStart((w) => addDays(w, -7));
  const nextWeek = () => setWeekStart((w) => addDays(w, 7));

  const monthLabel = addDays(weekStart, 3).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="bg-gray-900 border-b border-gray-800 px-2 py-3 select-none">
      {/* Month + nav */}
      <div className="flex items-center justify-between px-2 mb-2">
        <button
          onClick={prevWeek}
          className="w-8 h-8 flex items-center justify-center text-gray-400 active:text-white transition-colors text-lg"
          aria-label="Previous week"
        >
          ‹
        </button>
        <span className="text-gray-300 text-sm font-medium">{monthLabel}</span>
        <button
          onClick={nextWeek}
          className="w-8 h-8 flex items-center justify-center text-gray-400 active:text-white transition-colors text-lg"
          aria-label="Next week"
        >
          ›
        </button>
      </div>

      {/* Days row */}
      <div className="grid grid-cols-7 gap-1">
        {days.map(({ label, dateStr, dayNum, hasWorkout, isToday, isSelected }) => (
          <button
            key={dateStr}
            onClick={() => hasWorkout && onSelect(dateStr)}
            disabled={!hasWorkout}
            className={[
              'flex flex-col items-center py-1.5 rounded-xl transition-colors',
              isSelected
                ? 'bg-white text-gray-900'
                : hasWorkout
                ? 'active:bg-gray-700 text-white'
                : 'text-gray-600 cursor-default',
            ].join(' ')}
          >
            <span className="text-[10px] font-medium uppercase tracking-wide">{label}</span>
            <span className={['text-base font-semibold leading-tight', isSelected ? 'text-gray-900' : ''].join(' ')}>
              {dayNum}
            </span>
            {/* Workout dot */}
            <div className="h-1 mt-0.5">
              {hasWorkout && !isSelected && (
                <div className={['w-1 h-1 rounded-full', isToday ? 'bg-blue-400' : 'bg-gray-500'].join(' ')} />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
