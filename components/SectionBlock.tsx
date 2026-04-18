'use client';

import { Section } from '@/types/workout';
import MovementRow from './MovementRow';

interface Props {
  section: Section;
  meta: string;
  user: string;
  date: string;
}

const SECTION_COLORS: Record<string, string> = {
  warmup: 'text-orange-400',
  wod: 'text-blue-400',
  cashout: 'text-green-400',
};

export default function SectionBlock({ section, meta, user, date }: Props) {
  const headingColor = SECTION_COLORS[section.type] ?? 'text-gray-300';

  return (
    <div className="rounded-2xl bg-gray-800 overflow-hidden border border-gray-700">
      {/* Section header */}
      <div className="flex items-baseline justify-between px-4 py-3 border-b border-gray-700">
        <span className={`font-semibold text-sm uppercase tracking-wide ${headingColor}`}>
          {section.label}
        </span>
        {meta && <span className="text-gray-400 text-xs">{meta}</span>}
      </div>

      {/* Movements */}
      <div className="divide-y divide-gray-700/60">
        {section.movements.map((movement) => (
          <MovementRow
            key={movement.id}
            movement={movement}
            sessionKey={`${user}:${date}`}
          />
        ))}
      </div>
    </div>
  );
}
