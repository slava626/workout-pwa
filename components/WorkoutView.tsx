'use client';

import { WorkoutDay } from '@/types/workout';
import SectionBlock from './SectionBlock';
import { formatSeconds, getHiitTotalDurationSeconds } from '@/lib/sectionTiming';

interface Props {
  workout: WorkoutDay;
  user: string;
  workoutStarted: boolean;
  onStartWorkout: () => void;
  checks: Record<string, boolean>;
  notes: Record<string, string>;
  results: Record<string, string>;
  onCheck: (rowId: string, value: boolean) => void;
  onNote: (rowId: string, value: string) => void;
  onResult: (rowId: string, value: string) => void;
}

const STYLE_LABEL: Record<string, string> = {
  emom: 'EMOM', e2mom: 'E2MOM', e3mom: 'E3MOM', hiit: 'HIIT', amrap: 'AMRAP', tabata: 'Tabata', stretch: 'Stretch', other: '',
};

export default function WorkoutView({
  workout, user, workoutStarted, onStartWorkout,
  checks, notes, results, onCheck, onNote, onResult,
}: Props) {
  const dateLabel = new Date(workout.date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  return (
    <div className="px-4 py-4 pb-24 flex flex-col gap-4">
      {/* Date + Start button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold text-lg">{dateLabel}</h2>
          <span className="text-gray-500 text-sm">{workout.day}</span>
        </div>
      </div>

      {/* Full-width Start button — shown before workout begins */}
      {!workoutStarted && (
        <button
          onClick={onStartWorkout}
          className="w-full py-4 rounded-2xl bg-green-500 text-white font-bold text-xl active:bg-green-600 transition-colors shadow-lg shadow-green-500/20"
        >
          Start Workout
        </button>
      )}

      {workout.sections.map((section, i) => {
        const styleTag = section.type === 'cashout' && section.style ? STYLE_LABEL[section.style] || '' : '';
        const hiitMeta = section.style === 'hiit'
          ? [
              section.countdown && section.countdown > 0 ? `${formatSeconds(section.countdown)} prep` : null,
              section.work && section.work > 0 ? `${formatSeconds(section.work)} work` : null,
              section.rest && section.rest > 0 ? `${formatSeconds(section.rest)} rest` : null,
              getHiitTotalDurationSeconds(section) > 0 ? `${formatSeconds(getHiitTotalDurationSeconds(section))} total` : null,
            ].filter(Boolean).join(' · ')
          : null;
        const meta = [
          section.rounds && section.rounds > 1 ? `${section.rounds} rounds` : null,
          styleTag || null,
          hiitMeta || section.duration || null,
        ].filter(Boolean).join(' · ');

        return (
          <SectionBlock
            key={`${section.type}-${i}`}
            section={section}
            meta={meta}
            user={user}
            workoutStarted={workoutStarted}
            checks={checks}
            notes={notes}
            results={results}
            onCheck={onCheck}
            onNote={onNote}
            onResult={onResult}
          />
        );
      })}
    </div>
  );
}
