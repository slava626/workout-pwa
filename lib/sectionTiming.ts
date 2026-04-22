import { Movement, Section } from '@/types/workout';

export const EMOM_STYLES = new Set(['emom', 'e2mom', 'e3mom']);
export const HIIT_STYLE = 'hiit';

export interface SectionInterval {
  rowId: string;
  movement: Movement;
  label: string;
  round: number;
  interval: number;
}

export function intervalMinutes(style: string): number {
  if (style === 'e2mom') return 2;
  if (style === 'e3mom') return 3;
  return 1;
}

export function parseTotalMinutes(duration: string): number {
  const match = duration.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

export function formatSeconds(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}:${String(secs).padStart(2, '0')}` : `${secs}s`;
}

export function getSectionRounds(section: Section): number {
  return section.rounds && section.rounds > 1 ? section.rounds : 1;
}

export function getEmomIntervals(section: Section): SectionInterval[] {
  if (!section.duration || !section.style || !EMOM_STYLES.has(section.style)) return [];

  const totalMin = parseTotalMinutes(section.duration);
  const everyN = intervalMinutes(section.style);
  const totalIntervals = Math.floor(totalMin / everyN);

  return Array.from({ length: totalIntervals }, (_, i) => {
    const intervalNum = i + 1;
    const movement = section.movements[i % section.movements.length];
    const minuteStart = (intervalNum - 1) * everyN;
    const minuteEnd = minuteStart + everyN;
    const label = everyN === 1
      ? `Minute ${intervalNum}`
      : `${minuteStart}:00 – ${minuteEnd}:00`;

    return {
      rowId: `${movement.id}-m${intervalNum}`,
      movement,
      label,
      round: 1,
      interval: intervalNum,
    };
  });
}

export function getHiitIntervals(section: Section): SectionInterval[] {
  if (section.style !== HIIT_STYLE) return [];

  const rounds = getSectionRounds(section);
  const intervals: SectionInterval[] = [];
  let intervalNum = 1;

  for (let round = 1; round <= rounds; round++) {
    for (const movement of section.movements) {
      intervals.push({
        rowId: `${movement.id}-h${intervalNum}`,
        movement,
        label: rounds > 1 ? `Round ${round} · Interval ${intervalNum}` : `Interval ${intervalNum}`,
        round,
        interval: intervalNum,
      });
      intervalNum += 1;
    }
  }

  return intervals;
}

export function getHiitTotalDurationSeconds(section: Section): number {
  const intervals = getHiitIntervals(section).length;
  if (!intervals) return 0;

  const countdown = section.countdown && section.countdown > 0 ? section.countdown : 0;
  const work = section.work && section.work > 0 ? section.work : 0;
  const rest = section.rest && section.rest > 0 ? section.rest : 0;

  return countdown + (intervals * work) + (Math.max(intervals - 1, 0) * rest);
}
