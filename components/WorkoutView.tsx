'use client';

import { WorkoutDay } from '@/types/workout';
import SectionBlock from './SectionBlock';

interface Props {
  workout: WorkoutDay;
  user: string;
}

const STYLE_LABEL: Record<string, string> = {
  emom: 'EMOM',
  amrap: 'AMRAP',
  tabata: 'Tabata',
  stretch: 'Stretch',
  other: '',
};

export default function WorkoutView({ workout, user }: Props) {
  const dateLabel = new Date(workout.date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="px-4 py-4 pb-24 flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-white font-semibold text-lg">{dateLabel}</h2>
        <span className="text-gray-500 text-sm">{workout.day}</span>
      </div>

      {workout.sections.map((section) => {
        const styleTag =
          section.type === 'cashout' && section.style
            ? STYLE_LABEL[section.style] || ''
            : '';

        const meta = [
          section.rounds ? `${section.rounds} rounds` : null,
          styleTag || null,
          section.duration || null,
        ]
          .filter(Boolean)
          .join(' · ');

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
