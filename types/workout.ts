export type UserName = 'stone' | 'lightning' | 'ice';

export type SectionType = 'warmup' | 'wod' | 'cashout';
export type CashoutStyle = 'emom' | 'amrap' | 'tabata' | 'stretch' | 'other';
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface Movement {
  id: string;
  name: string;
  sets?: number;
  reps?: number;
  weight?: string;
  note?: string;
}

export interface Section {
  type: SectionType;
  label: string;
  rounds?: number;
  style?: CashoutStyle;
  duration?: string;
  movements: Movement[];
}

export interface WorkoutDay {
  day: DayOfWeek;
  date: string; // YYYY-MM-DD
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
  ended: boolean;
}
