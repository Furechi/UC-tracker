import type { DailyRecord, Medication } from "./storage"; // 必要に応じて調整

export function emptyRecord(date: string, medications: Medication[] = []): DailyRecord {
  return {
    date,
    completed: false,
    meds: Object.fromEntries((medications || []).map((m) => [m.id, false])),
    meals: [],
    stool: null,
    blood: null,
    pain: null,
    sleepStart: "",
    sleepEnd: "",
    workLocation: "",
    workHours: 0,
    condition: "",
    bowelCount: 0,
  };
}

export const theme = {
  bg: "#0f1117",
  card: "#1a1d27",
  cardHover: "#222636",
  accent: "#6c9cfc",
  accentSoft: "rgba(108,156,252,0.12)",
  accentGlow: "rgba(108,156,252,0.25)",
  green: "#4ecba0",
  greenSoft: "rgba(78,203,160,0.12)",
  orange: "#f5a742",
  orangeSoft: "rgba(245,167,66,0.12)",
  red: "#f06868",
  redSoft: "rgba(240,104,104,0.12)",
  text: "#e8eaf0",
  textSub: "#8a8fa8",
  textMuted: "#555b73",
  border: "#2a2e3d",
} as const;

export const BLOOD_OPTIONS = ["なし", "少量", "中量", "多量"];
export const STOOL_OPTIONS = ["下痢", "軟便", "普通", "硬い"];
export const PAIN_OPTIONS = ["なし", "軽い", "中程度", "強い"];
export const WORK_LOCATION = ["出社", "リモート", "休み"];
export const MEAL_TYPES = ["朝食", "昼食", "夕食", "間食"];
export const FOOD_TAGS = ["脂質", "香辛料", "乳製品", "FODMAP", "アルコール", "カフェイン", "小麦", "生もの"];

export const INPUT_SECTIONS = [
  { id: "bowel", title: "排便", icon: "●" },
  { id: "meds", title: "服薬", icon: "◎" },
  { id: "meals", title: "食事", icon: "▣" },
  { id: "sleep", title: "睡眠", icon: "◐" },
  { id: "work", title: "仕事", icon: "□" },
  { id: "condition", title: "体調", icon: "♡" },
];
