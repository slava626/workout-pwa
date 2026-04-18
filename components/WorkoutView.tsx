'use client';

import { WorkoutDay } from '@/types/workout';
import SectionBlock from './SectionBlock';

interface Props {
  workout: WorkoutDay;
  user: string;
  workoutStarted: boolean;
  onStartWorkout: () => void;
}

const STYLE_LABEL: Record<string, string> = {
  emom: 'EMOM',
  amrap: 'AMRAP',
  tabata: 'Tabata',
  stretch: 'Stretch',
  other: '',
};

export default function WorkoutView({ workout, user, workoutStarted, onStartWorkout }: Props) {
  const dateLabel = new Date(workout.date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="px-4 py-4 pb-24 flex flex-col gap-4">
      {/* Date header + Start button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold text-lg">{dateLabel}</h2>
          <span className="text-gray-500 text-sm">{workout.day}</span>
        </div>
        {!workoutStarted && (
          <button
            onClick={onStartWorkout}
            className="px-5 py-2.5 rounded-full bg-green-500 text-white font-semibold text-sm active:bg-green-600 transition-colors shadow-lg shadow-green-500/20"
          >
            Start
          </button>
        )}
      </div>

      {workout.sections.map((section) => {
        const styleTag =
          section.type === 'cashout' && section.style
            ? STYLE_LABEL[section.style] || ''
            : '';

        const meta = [
          section.rounds && section.rounds > 1 ? `${section.rounds} rounds` : null,
          styleTag || null,
          section.duration || null,
        ].filter(Boolean).join(' · ');

        return (
          <SectionBlock
            key={section.type}
            section={section}
            meta={meta}
            user={user}
            date={workout.date}
          />
        );
      })}
    </div>
  );
}
