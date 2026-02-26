export type DailyRecord = {
  date: string;
  completed: boolean;
  meds: Record<string, boolean>;
  meals: any[]; // 必要に応じて型を定義
  stool: string | null;
  blood: string | null;
  pain: string | null;
  sleepStart: string;
  sleepEnd: string;
  workLocation: string;
  workHours: number;
  condition: string;
  bowelCount: number;
};

