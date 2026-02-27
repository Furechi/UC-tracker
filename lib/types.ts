export type DailyRecord = {
  date: string;
  completed: boolean;
  meds: Record<string, boolean>;
  meals: any[];
  stool: string | null;
  blood: string | null;
  pain: string | null;
  sleepStart: string | null;
  sleepEnd: string | null;
  workLocation: string | null;
  workHours: number | null;
  condition: string;
  bowelCount: number;
};

