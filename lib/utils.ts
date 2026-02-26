import type { DailyRecord } from "./types";

/**
 * 今日の日付を "YYYY-MM-DD" 形式で返す
 */
export function today(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * 睡眠時間（時間数）を計算する
 */
export function sleepDuration(start: string, end: string): number {
  if (!start || !end) return 0;
  const startDate = new Date(`1970-01-01T${start}:00`);
  const endDate = new Date(`1970-01-01T${end}:00`);
  let diff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
  if (diff < 0) diff += 24;
  return Math.round(diff * 10) / 10;
}

/**
 * 1週間分の日付（YYYY-MM-DD）を返す
 */
export function getWeekDates(todayStr: string): string[] {
  const date = new Date(todayStr);
  const day = date.getDay(); // 0 (日) ～ 6 (土)
  const sunday = new Date(date);
  sunday.setDate(date.getDate() - day);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return d.toISOString().split("T")[0];
  });
}

/**
 * 記録の達成度（0〜100%）を計算する
 */
export function completionPct(record: DailyRecord): number {
  let total = 0;
  let completed = 0;

  if (record.meds) {
    total++;
    if (Object.values(record.meds).every(Boolean)) completed++;
  }

  if (record.meals) {
    total++;
    if (record.meals.length > 0) completed++;
  }

  if (record.sleepStart && record.sleepEnd) {
    total++;
    completed++;
  }

  if (record.stool || record.blood || record.pain) {
    total++;
    if (record.stool || record.blood || record.pain) completed++;
  }

  if (record.condition) {
    total++;
    completed++;
  }

  return total > 0 ? Math.round((completed / total) * 100) : 0;
}
export type Medication = {
  id: string;
  name: string;
};

export type MealEntry = {
  type: string; // 例: "朝食", "昼食" など
  time: string; // "HH:mm" 形式
  content: string;
  tags: string[];
};

export type DailyRecord = {
  date: string;
  completed: boolean;
  meds: Record<string, boolean>; // medication.id をキーにした服薬チェック
  meals: MealEntry[];
  stool: string | null;
  blood: string | null;
  pain: string | null;
  sleepStart: string;
  sleepEnd: string;
  workLocation: string;
  workHours: number;
  condition: string;
};

export type RecordsMap = Record<string, DailyRecord>; // "YYYY-MM-DD" をキーにした記録のマップ







