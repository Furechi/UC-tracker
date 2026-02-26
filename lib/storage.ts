/**
 * ストレージユーティリティ
 * 現在: localStorage
 * 将来: Supabase に差し替え可能な設計
 */

const RECORDS_KEY = "uc-tracker-records";
const MEDS_KEY = "uc-tracker-medications";

function safeGetItem(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.error("Storage save failed:", e);
  }
}

// ── Records ──

export interface MealEntry {
  type: string;
  text: string;
  tags: string[];
}

export interface DailyRecord {
  date: string;
  bowelCount: number;
  blood: string;
  stoolType: string;
  abdominalPain: string;
  sleepStart: string;
  sleepEnd: string;
  workHours: number;
  stressLevel: number;
  workLocation: string;
  conditionScore: number;
  memo: string;
  meals: MealEntry[];
  meds: Record<string, boolean>;
  completed: boolean;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
}

export type RecordsMap = Record<string, DailyRecord>;

export function loadRecords(): RecordsMap {
  const raw = safeGetItem(RECORDS_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveRecords(records: RecordsMap): void {
  safeSetItem(RECORDS_KEY, JSON.stringify(records));
}

export function loadMedications(): Medication[] {
  const raw = safeGetItem(MEDS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveMedications(meds: Medication[]): void {
  safeSetItem(MEDS_KEY, JSON.stringify(meds));
}

// ── ヘルパー ──

export function emptyRecord(date: string, medsList: Medication[] = []): DailyRecord {
  return {
    date,
    bowelCount: 0,
    blood: "なし",
    stoolType: "普通",
    abdominalPain: "なし",
    sleepStart: "23:00",
    sleepEnd: "07:00",
    workHours: 8,
    stressLevel: 3,
    workLocation: "出社",
    conditionScore: 5,
    memo: "",
    meals: [],
    meds: medsList.reduce((a, m) => ({ ...a, [m.id]: false }), {} as Record<string, boolean>),
    completed: false,
  };
}

export function today(): string {
  return new Date().toISOString().split("T")[0];
}

export function sleepDuration(start: string, end: string): string | null {
  if (!start || !end) return null;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let diff = eh * 60 + em - (sh * 60 + sm);
  if (diff <= 0) diff += 24 * 60;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return `${h}h${m > 0 ? m + "m" : ""}`;
}

export function getWeekDates(baseDate: string): string[] {
  const d = new Date(baseDate);
  const day = d.getDay();
  const mon = new Date(d);
  mon.setDate(d.getDate() - ((day + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(mon);
    dd.setDate(mon.getDate() + i);
    return dd.toISOString().split("T")[0];
  });
}

export function completionPct(rec: DailyRecord): number {
  if (rec.completed) return 100;
  const total = 7;
  let done = 0;
  if (rec.bowelCount > 0 || rec.blood !== "なし" || rec.stoolType !== "普通") done++;
  else done += 0.3;
  if (rec.abdominalPain !== "なし") done++;
  else done += 0.3;
  const medKeys = Object.keys(rec.meds);
  if (medKeys.length > 0 && Object.values(rec.meds).some(Boolean)) done++;
  else if (medKeys.length === 0) done += 1;
  if (rec.meals.length > 0) done++;
  if (rec.sleepStart && rec.sleepEnd) done++;
  if (rec.conditionScore !== 5) done++;
  else done += 0.3;
  done++; // work section default
  return Math.min(100, Math.round((done / total) * 100));
}
