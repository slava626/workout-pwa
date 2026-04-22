export type UserName = 'stone' | 'lightning' | 'ice' | 'genesis';

export type SectionType = 'warmup' | 'wod' | 'cashout';
export type CashoutStyle = 'emom' | 'e2mom' | 'e3mom' | 'amrap' | 'tabata' | 'stretch' | 'other';
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
export type ResultUnit = 'reps' | 'calories' | 'time' | 'lbs' | 'kg' | 'meters';

export interface Movement {
  id: string;
  name: string;
  media?: string;         // optional image/gif URL (e.g. /media/movements/back-squat.webp)
  sets?: number;
  reps?: number;
  weight?: string;
  note?: string;
  trackResult?: boolean;   // show result entry field
  unit?: ResultUnit;       // unit label for result entry
}

export interface Section {
  type: SectionType;
  label: string;
  sets?: number;
  rounds?: number;
  style?: CashoutStyle;
  duration?: string;
  movements: Movement[];
}

export interface WorkoutDay {
  day: DayOfWeek;
  date: string;
  sections: Section[];
}

export interface Week {
  week: number;
  days: WorkoutDay[];
}

export interface Program {
  user: UserName;
  weeks: Week[];
}

export interface SessionState {
  startedAt: string | null;
  checks: Record<string, boolean>;
  notes: Record<string, string>;
  results: Record<string, string>;
  ended: boolean;
}
