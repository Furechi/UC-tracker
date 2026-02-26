"use client";

import { useState, useEffect, useCallback } from "react";
import { theme, BLOOD_OPTIONS, STOOL_OPTIONS, PAIN_OPTIONS, WORK_LOCATION, MEAL_TYPES, FOOD_TAGS, INPUT_SECTIONS } from "@/lib/constants";
import {
  DailyRecord, Medication, MealEntry, RecordsMap,
  loadRecords, saveRecords, loadMedications, saveMedications,
  emptyRecord, today, sleepDuration, getWeekDates, completionPct,
} from "@/lib/storage";
import { Pill, SectionCard, Counter, ScoreSlider } from "./ui";
import { IMEInput, IMETextarea } from "./IMEInput";

type ViewType = "home" | "input" | "history" | "insights";

export default function UCTracker() {
  const [view, setView] = useState<ViewType>("home");
  const [records, setRecords] = useState<RecordsMap>({});
  const [selectedDate, setSelectedDate] = useState(today());
  const [currentRecord, setCurrentRecord] = useState<DailyRecord>(emptyRecord(today()));
  const [inputSection, setInputSection] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [mealDraft, setMealDraft] = useState<MealEntry>({ type: "昼食", text: "", tags: [] });
  const [showMealModal, setShowMealModal] = useState(false);
  const [showMedForm, setShowMedForm] = useState(false);
  const [medDraft, setMedDraft] = useState({ name: "", dosage: "" });
  const [editingMedId, setEditingMedId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // ── Load data on mount ──
  useEffect(() => {
  const init = async () => {
    const r = await loadRecords();
    const m = await loadMedications();
    setRecords(r);
    setMedications(m);
    if (r[today()]) setCurrentRecord(r[today()]);
    else setCurrentRecord(emptyRecord(today(), m));
    setLoaded(true);
  };
  init();
}, []);

  // ── Update current record when date/medications change ──
  useEffect(() => {
    if (!loaded) return;
    if (records[selectedDate]) {
      const rec = records[selectedDate];
      const updatedMeds = medications.reduce(
        (a, m) => ({ ...a, [m.id]: rec.meds?.[m.id] || false }),
        {} as Record<string, boolean>
      );
      setCurrentRecord({ ...rec, meds: updatedMeds });
    } else {
      const yd = new Date(selectedDate);
      yd.setDate(yd.getDate() - 1);
      const ydk = yd.toISOString().split("T")[0];
      const prev = records[ydk];
      const nr = emptyRecord(selectedDate, medications);
      if (prev) {
        nr.sleepStart = prev.sleepStart;
        nr.sleepEnd = prev.sleepEnd;
        nr.workLocation = prev.workLocation;
        nr.workHours = prev.workHours;
      }
      setCurrentRecord(nr);
    }
  }, [selectedDate, records, medications, loaded]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const updateRecord = useCallback(<K extends keyof DailyRecord>(key: K, val: DailyRecord[K]) => {
    setCurrentRecord((prev) => ({ ...prev, [key]: val }));
  }, []);

  const saveRecord = async () => {
  setSaving(true);
  const updated = { ...records, [selectedDate]: { ...currentRecord, completed: true } };
  setRecords(updated);
  setCurrentRecord((prev) => ({ ...prev, completed: true }));
  await saveRecords(updated);  // ← await 追加
  setSaving(false);
  showToast("保存しました ✓");
  setTimeout(() => setView("home"), 600);
};

  // ── NavBar ──
  const NavBar = () => (
    <div
      style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(15,17,23,0.92)", backdropFilter: "blur(20px)",
        borderTop: `1px solid ${theme.border}`, display: "flex",
        padding: "6px 0 env(safe-area-inset-bottom, 8px)",
        maxWidth: 480, margin: "0 auto",
      }}
    >
      {([
        { id: "home" as const, icon: "⊞", label: "ホーム" },
        { id: "input" as const, icon: "✎", label: "記録" },
        { id: "history" as const, icon: "▦", label: "履歴" },
        { id: "insights" as const, icon: "◈", label: "分析" },
      ]).map((t) => (
        <button
          key={t.id}
          onClick={() => { setView(t.id); if (t.id === "input") setInputSection(0); }}
          style={{
            flex: 1, background: "none", border: "none", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "8px 0",
            color: view === t.id ? theme.accent : theme.textMuted, transition: "color 0.15s",
          }}
        >
          <span style={{ fontSize: 20 }}>{t.icon}</span>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.5 }}>{t.label}</span>
        </button>
      ))}
    </div>
  );

  // ── Home View ──
  const HomeView = () => {
    const rec = records[today()] || currentRecord;
    const pct = completionPct(rec);
    const weekDates = getWeekDates(today());
    const dayNames = ["月", "火", "水", "木", "金", "土", "日"];

    return (
      <div style={{ padding: "20px 16px 100px" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, color: theme.textSub, marginBottom: 4 }}>
            {new Date().toLocaleDateString("ja-JP", { month: "long", day: "numeric", weekday: "short" })}
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: theme.text, margin: 0 }}>体調記録</h1>
        </div>

        {/* Week strip */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
          {weekDates.map((d, i) => {
            const isToday = d === today();
            const hasRecord = records[d]?.completed;
            return (
              <button
                key={d}
                onClick={() => { setSelectedDate(d); setView("input"); setInputSection(0); }}
                style={{
                  flex: 1, padding: "8px 0", borderRadius: 12, border: "none", cursor: "pointer",
                  background: isToday ? theme.accentSoft : "transparent",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                }}
              >
                <span style={{ fontSize: 10, color: theme.textMuted, fontWeight: 600 }}>{dayNames[i]}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: isToday ? theme.accent : theme.textSub }}>
                  {new Date(d).getDate()}
                </span>
                <span style={{ width: 6, height: 6, borderRadius: 3, background: hasRecord ? theme.green : "transparent" }} />
              </button>
            );
          })}
        </div>

        {/* Progress */}
        <SectionCard>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: theme.text }}>今日の記録</span>
            <span style={{ fontSize: 12, color: pct === 100 ? theme.green : theme.textSub, fontWeight: 600 }}>
              {pct === 100 ? "完了 ✓" : `${pct}%`}
            </span>
          </div>
          <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden", marginBottom: 16 }}>
            <div
              style={{
                height: "100%", borderRadius: 2, transition: "width 0.4s",
                width: `${pct}%`,
                background: pct === 100 ? theme.green : `linear-gradient(90deg, ${theme.accent}, ${theme.green})`,
              }}
            />
          </div>
          <button
            onClick={() => { setSelectedDate(today()); setView("input"); setInputSection(0); }}
            style={{
              width: "100%", padding: "14px", borderRadius: 14, border: "none",
              background: `linear-gradient(135deg, ${theme.accent}, #8b6cf5)`,
              color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
              boxShadow: `0 4px 20px ${theme.accentGlow}`,
            }}
          >
            {rec.completed ? "記録を編集する" : "今日の記録を入力 →"}
          </button>
        </SectionCard>

        {/* Summary if completed */}
        {rec.completed && (
          <SectionCard title="今日のサマリー" icon="◉">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { label: "排便", value: `${rec.bowelCount}回`, color: rec.bowelCount > 5 ? theme.orange : theme.text },
                { label: "血便", value: rec.blood, color: rec.blood !== "なし" ? theme.red : theme.green },
                { label: "体調", value: `${rec.conditionScore}/10`, color: rec.conditionScore <= 3 ? theme.red : rec.conditionScore <= 6 ? theme.orange : theme.green },
                { label: "睡眠", value: sleepDuration(rec.sleepStart, rec.sleepEnd) || "--", color: theme.text },
              ].map((s, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 12px" }}>
                  <div style={{ fontSize: 10, color: theme.textMuted, marginBottom: 4, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: 0.5 }}>{s.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* Weekly trend */}
        <SectionCard title="直近7日間" icon="〜">
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
            {weekDates.map((d) => {
              const r = records[d];
              const score = r?.conditionScore || 0;
              const h = score ? (score / 10) * 60 + 10 : 4;
              const color = !r ? "rgba(255,255,255,0.05)" : score <= 3 ? theme.red : score <= 6 ? theme.orange : theme.green;
              return (
                <div key={d} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 9, color: theme.textMuted }}>{score || ""}</span>
                  <div style={{ width: "100%", height: h, background: color, borderRadius: 4, transition: "height 0.3s" }} />
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>
    );
  };

  // ── Input View ──
  const InputView = () => {
    const sec = INPUT_SECTIONS[inputSection];
    const dateLabel = selectedDate === today() ? "今日" : new Date(selectedDate).toLocaleDateString("ja-JP", { month: "short", day: "numeric" });

    return (
      <div style={{ padding: "16px 16px 120px", minHeight: "100vh" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <button onClick={() => setView("home")} style={{ background: "none", border: "none", color: theme.textSub, fontSize: 14, cursor: "pointer" }}>← 戻る</button>
          <span style={{ fontSize: 14, fontWeight: 700, color: theme.text }}>{dateLabel}の記録</span>
          <div style={{ width: 40 }} />
        </div>

        {/* Section tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
          {INPUT_SECTIONS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setInputSection(i)}
              style={{
                padding: "6px 12px", borderRadius: 16, border: "none", cursor: "pointer", whiteSpace: "nowrap",
                background: i === inputSection ? theme.accentSoft : "transparent",
                color: i === inputSection ? theme.accent : theme.textMuted,
                fontSize: 12, fontWeight: 600, transition: "all 0.15s",
              }}
            >
              {s.icon} {s.title}
            </button>
          ))}
        </div>

        {/* Section content */}
        <div style={{ minHeight: 300 }}>
          {sec.id === "bowel" && (
            <>
              <SectionCard title="排便回数" icon="●">
                <Counter value={currentRecord.bowelCount} onChange={(v) => updateRecord("bowelCount", v)} />
              </SectionCard>
              <SectionCard title="血便" icon="◉">
                <div style={{ display: "flex", gap: 6 }}>
                  {BLOOD_OPTIONS.map((o) => (
                    <Pill key={o} active={currentRecord.blood === o} onClick={() => updateRecord("blood", o)}
                      color={o === "なし" ? theme.green : o === "少量" ? theme.orange : theme.red}
                      softColor={o === "なし" ? theme.greenSoft : o === "少量" ? theme.orangeSoft : theme.redSoft}>
                      {o}
                    </Pill>
                  ))}
                </div>
              </SectionCard>
              <SectionCard title="便の状態" icon="◎">
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {STOOL_OPTIONS.map((o) => (
                    <Pill key={o} active={currentRecord.stoolType === o} onClick={() => updateRecord("stoolType", o)}>{o}</Pill>
                  ))}
                </div>
              </SectionCard>
              <SectionCard title="腹痛" icon="△">
                <div style={{ display: "flex", gap: 6 }}>
                  {PAIN_OPTIONS.map((o) => (
                    <Pill key={o} active={currentRecord.abdominalPain === o} onClick={() => updateRecord("abdominalPain", o)}
                      color={o === "なし" ? theme.green : o === "強い" ? theme.red : theme.orange}
                      softColor={o === "なし" ? theme.greenSoft : o === "強い" ? theme.redSoft : theme.orangeSoft}>
                      {o}
                    </Pill>
                  ))}
                </div>
              </SectionCard>
            </>
          )}

          {sec.id === "meds" && (
            <SectionCard title="今日の服薬" icon="◎">
              {medications.length === 0 ? (
                <div style={{ color: theme.textMuted, fontSize: 13, marginBottom: 12, textAlign: "center", padding: "12px 0" }}>
                  薬が登録されていません。下のボタンから追加してください。
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
                  {medications.map((med) => {
                    const taken = currentRecord.meds[med.id];
                    return (
                      <div key={med.id} style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
                        <button
                          onClick={() => updateRecord("meds", { ...currentRecord.meds, [med.id]: !taken })}
                          style={{
                            flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "14px 16px", borderRadius: 12, border: `1px solid ${taken ? theme.green : theme.border}`,
                            background: taken ? theme.greenSoft : "transparent", cursor: "pointer", transition: "all 0.15s",
                          }}
                        >
                          <div style={{ textAlign: "left" }}>
                            <div style={{ fontSize: 15, fontWeight: 700, color: theme.text }}>{med.name}</div>
                            {med.dosage && <div style={{ fontSize: 12, color: theme.textSub }}>{med.dosage}</div>}
                          </div>
                          <div style={{
                            width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                            background: taken ? theme.green : "rgba(255,255,255,0.06)",
                            color: taken ? "#fff" : theme.textMuted, fontSize: 16, fontWeight: 700,
                          }}>
                            {taken ? "✓" : ""}
                          </div>
                        </button>
                        <button
                          onClick={() => { setEditingMedId(med.id); setMedDraft({ name: med.name, dosage: med.dosage || "" }); setShowMedForm(true); }}
                          style={{
                            width: 40, borderRadius: 12, border: `1px solid ${theme.border}`,
                            background: "transparent", color: theme.textMuted, fontSize: 12, cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                        >
                          ✎
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              <button
                onClick={() => { setEditingMedId(null); setMedDraft({ name: "", dosage: "" }); setShowMedForm(true); }}
                style={{
                  width: "100%", padding: 12, borderRadius: 12, border: `1px dashed ${theme.border}`,
                  background: "transparent", color: theme.accent, fontSize: 14, cursor: "pointer", fontWeight: 600,
                }}
              >
                + 薬を追加
              </button>
            </SectionCard>
          )}

          {sec.id === "meals" && (
            <SectionCard title="食事記録" icon="▣">
              {currentRecord.meals.length === 0 && (
                <div style={{ color: theme.textMuted, fontSize: 13, marginBottom: 12 }}>まだ記録がありません</div>
              )}
              {currentRecord.meals.map((m, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.03)", marginBottom: 8,
                }}>
                  <div>
                    <span style={{ fontSize: 11, color: theme.accent, fontWeight: 700, marginRight: 8 }}>{m.type}</span>
                    <span style={{ fontSize: 14, color: theme.text }}>{m.text}</span>
                    <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                      {m.tags.map((t) => (
                        <span key={t} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 8, background: theme.orangeSoft, color: theme.orange }}>{t}</span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const meals = [...currentRecord.meals];
                      meals.splice(i, 1);
                      updateRecord("meals", meals);
                    }}
                    style={{ background: "none", border: "none", color: theme.textMuted, cursor: "pointer", fontSize: 16, flexShrink: 0 }}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={() => { setShowMealModal(true); setMealDraft({ type: "昼食", text: "", tags: [] }); }}
                style={{
                  width: "100%", padding: 12, borderRadius: 12, border: `1px dashed ${theme.border}`,
                  background: "transparent", color: theme.accent, fontSize: 14, cursor: "pointer", fontWeight: 600,
                }}
              >
                + 食事を追加
              </button>
            </SectionCard>
          )}

          {sec.id === "sleep" && (
            <SectionCard title="睡眠" icon="◐">
              <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
                {(["sleepStart", "sleepEnd"] as const).map((key) => (
                  <div key={key} style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: theme.textSub, marginBottom: 6, fontWeight: 600 }}>
                      {key === "sleepStart" ? "就寝" : "起床"}
                    </div>
                    <input
                      type="time"
                      value={currentRecord[key]}
                      onChange={(e) => updateRecord(key, e.target.value)}
                      style={{
                        width: "100%", padding: "12px", borderRadius: 12, border: `1px solid ${theme.border}`,
                        background: "rgba(255,255,255,0.04)", color: theme.text, fontSize: 18, fontWeight: 700,
                        textAlign: "center", boxSizing: "border-box",
                      }}
                    />
                  </div>
                ))}
              </div>
              {currentRecord.sleepStart && currentRecord.sleepEnd && (
                <div style={{ textAlign: "center", color: theme.accent, fontSize: 14, fontWeight: 700 }}>
                  睡眠時間: {sleepDuration(currentRecord.sleepStart, currentRecord.sleepEnd)}
                </div>
              )}
            </SectionCard>
          )}

          {sec.id === "work" && (
            <>
              <SectionCard title="勤務形態" icon="□">
                <div style={{ display: "flex", gap: 6 }}>
                  {WORK_LOCATION.map((o) => (
                    <Pill key={o} active={currentRecord.workLocation === o} onClick={() => updateRecord("workLocation", o)} style={{ flex: 1, textAlign: "center" }}>{o}</Pill>
                  ))}
                </div>
              </SectionCard>
              {currentRecord.workLocation !== "休み" && (
                <>
                  <SectionCard title="勤務時間" icon="◷">
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 28, fontWeight: 800, color: theme.text }}>{currentRecord.workHours}h</span>
                      <input type="range" min={0} max={16} value={currentRecord.workHours}
                        onChange={(e) => updateRecord("workHours", Number(e.target.value))}
                        style={{ flex: 1, background: theme.border }} />
                    </div>
                  </SectionCard>
                  <SectionCard title="ストレス度" icon="◆">
                    <div style={{ display: "flex", gap: 8 }}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button key={n} onClick={() => updateRecord("stressLevel", n)}
                          style={{
                            flex: 1, height: 48, borderRadius: 12, border: "none", cursor: "pointer",
                            background: currentRecord.stressLevel === n ? (n <= 2 ? theme.greenSoft : n <= 3 ? theme.orangeSoft : theme.redSoft) : "rgba(255,255,255,0.04)",
                            color: currentRecord.stressLevel === n ? (n <= 2 ? theme.green : n <= 3 ? theme.orange : theme.red) : theme.textMuted,
                            fontSize: 18, fontWeight: 800, transition: "all 0.15s",
                          }}>
                          {n}
                        </button>
                      ))}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 10, color: theme.textMuted }}>
                      <span>低い</span><span>高い</span>
                    </div>
                  </SectionCard>
                </>
              )}
            </>
          )}

          {sec.id === "condition" && (
            <>
              <SectionCard title="今日の体調スコア" icon="♡">
                <ScoreSlider value={currentRecord.conditionScore} onChange={(v) => updateRecord("conditionScore", v)} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 10, color: theme.textMuted }}>
                  <span>最悪</span><span>最高</span>
                </div>
              </SectionCard>
              <SectionCard title="メモ（任意）" icon="✎">
                <IMETextarea
                  value={currentRecord.memo}
                  onChange={(v) => updateRecord("memo", v)}
                  placeholder="気になったことなどを自由に..."
                  rows={3}
                  style={{
                    width: "100%", padding: 12, borderRadius: 12, border: `1px solid ${theme.border}`,
                    background: "rgba(255,255,255,0.04)", color: theme.text, fontSize: 14,
                    resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box",
                  }}
                />
              </SectionCard>
            </>
          )}
        </div>

        {/* Nav buttons */}
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          {inputSection > 0 && (
            <button onClick={() => setInputSection((s) => s - 1)} style={{
              padding: "14px 20px", borderRadius: 14, border: `1px solid ${theme.border}`,
              background: "transparent", color: theme.textSub, fontSize: 14, cursor: "pointer", fontWeight: 600,
            }}>←</button>
          )}
          {inputSection < INPUT_SECTIONS.length - 1 ? (
            <button onClick={() => setInputSection((s) => s + 1)} style={{
              flex: 1, padding: 14, borderRadius: 14, border: "none",
              background: theme.accentSoft, color: theme.accent, fontSize: 15, fontWeight: 700, cursor: "pointer",
            }}>
              次へ → {INPUT_SECTIONS[inputSection + 1].title}
            </button>
          ) : (
            <button onClick={saveRecord} disabled={saving} style={{
              flex: 1, padding: 14, borderRadius: 14, border: "none",
              background: `linear-gradient(135deg, ${theme.green}, #2da87a)`,
              color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 4px 20px rgba(78,203,160,0.3)", opacity: saving ? 0.6 : 1,
            }}>
              {saving ? "保存中..." : "記録を保存 ✓"}
            </button>
          )}
        </div>

        {/* Progress dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 14 }}>
          {INPUT_SECTIONS.map((_, i) => (
            <div key={i} style={{
              width: i === inputSection ? 20 : 6, height: 6, borderRadius: 3,
              background: i === inputSection ? theme.accent : i < inputSection ? theme.green : theme.border,
              transition: "all 0.2s",
            }} />
          ))}
        </div>
      </div>
    );
  };

  // ── History View ──
  const HistoryView = () => {
    const [monthOffset, setMonthOffset] = useState(0);
    const now = new Date();
    const viewMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = (firstDay + 6) % 7;

    const days: (number | null)[] = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    return (
      <div style={{ padding: "20px 16px 100px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: theme.text, margin: "0 0 20px" }}>履歴</h1>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <button onClick={() => setMonthOffset((m) => m - 1)} style={{ background: "none", border: "none", color: theme.textSub, fontSize: 20, cursor: "pointer" }}>◀</button>
          <span style={{ fontSize: 16, fontWeight: 700, color: theme.text }}>{year}年{month + 1}月</span>
          <button onClick={() => setMonthOffset((m) => m + 1)} style={{ background: "none", border: "none", color: theme.textSub, fontSize: 20, cursor: "pointer" }}>▶</button>
        </div>
        <SectionCard>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
            {["月", "火", "水", "木", "金", "土", "日"].map((d) => (
              <div key={d} style={{ textAlign: "center", fontSize: 10, color: theme.textMuted, fontWeight: 600, padding: "4px 0" }}>{d}</div>
            ))}
            {days.map((d, i) => {
              if (!d) return <div key={`e${i}`} />;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
              const rec = records[dateStr];
              const isToday = dateStr === today();
              const score = rec?.conditionScore;
              const bg = !rec ? "transparent" : score! <= 3 ? theme.redSoft : score! <= 6 ? theme.orangeSoft : theme.greenSoft;
              return (
                <button
                  key={dateStr}
                  onClick={() => { setSelectedDate(dateStr); setView("input"); setInputSection(0); }}
                  style={{
                    aspectRatio: "1", borderRadius: 10, border: `2px solid ${isToday ? theme.accent : "transparent"}`,
                    background: bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", gap: 2, padding: 0,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: isToday ? theme.accent : rec ? theme.text : theme.textMuted }}>{d}</span>
                  {rec && <span style={{ fontSize: 9, fontWeight: 700, color: score! <= 3 ? theme.red : score! <= 6 ? theme.orange : theme.green }}>{score}</span>}
                </button>
              );
            })}
          </div>
        </SectionCard>

        {Object.keys(records).length > 0 && (
          <SectionCard title="統計" icon="▤">
            {(() => {
              const vals = Object.values(records).filter((r) => r.completed);
              if (vals.length === 0) return <div style={{ color: theme.textMuted, fontSize: 13 }}>データなし</div>;
              const avgScore = (vals.reduce((a, r) => a + r.conditionScore, 0) / vals.length).toFixed(1);
              const avgBowel = (vals.reduce((a, r) => a + r.bowelCount, 0) / vals.length).toFixed(1);
              const bloodDays = vals.filter((r) => r.blood !== "なし").length;
              return (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  {[
                    { label: "平均体調", value: avgScore, color: theme.accent },
                    { label: "平均排便", value: avgBowel, color: theme.text },
                    { label: "血便日数", value: String(bloodDays), color: bloodDays > 0 ? theme.red : theme.green },
                  ].map((s) => (
                    <div key={s.label} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                      <div style={{ fontSize: 10, color: theme.textMuted }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </SectionCard>
        )}
      </div>
    );
  };

  // ── Insights View ──
  const InsightsView = () => {
    const recordCount = Object.values(records).filter((r) => r.completed).length;
    return (
      <div style={{ padding: "20px 16px 100px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: theme.text, margin: "0 0 20px" }}>分析</h1>
        <SectionCard>
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>◈</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: theme.text, marginBottom: 8 }}>
              {recordCount < 14 ? "データを蓄積中..." : "分析準備完了"}
            </div>
            <div style={{ fontSize: 13, color: theme.textSub, lineHeight: 1.6 }}>
              {recordCount < 14
                ? `あと${Math.max(0, 14 - recordCount)}日分のデータで分析が始まります。現在 ${recordCount} 日分の記録があります。`
                : "十分なデータが溜まりました。相関分析やパターン検出が可能です。"}
            </div>
          </div>
        </SectionCard>
      </div>
    );
  };

  // ── Loading ──
  if (!loaded) {
    return (
      <div style={{ background: theme.bg, height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: theme.textSub, fontSize: 15 }}>読み込み中...</div>
      </div>
    );
  }

  // ── Render ──
  return (
    <div style={{
      background: theme.bg, minHeight: "100vh", maxWidth: 480, margin: "0 auto",
      color: theme.text, position: "relative",
    }}>
      {view === "home" && <HomeView />}
      {view === "input" && <InputView />}
      {view === "history" && <HistoryView />}
      {view === "insights" && <InsightsView />}
      <NavBar />

      {/* Meal Modal */}
      {showMealModal && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowMealModal(false); }}
        >
          <div style={{ width: "100%", maxWidth: 480, background: theme.card, borderRadius: "20px 20px 0 0", padding: "20px 18px 32px", maxHeight: "80vh", overflow: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: theme.text }}>食事を追加</span>
              <button onClick={() => setShowMealModal(false)} style={{ background: "none", border: "none", color: theme.textSub, fontSize: 20, cursor: "pointer" }}>×</button>
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
              {MEAL_TYPES.map((t) => (
                <Pill key={t} active={mealDraft.type === t} onClick={() => setMealDraft((d) => ({ ...d, type: t }))}>{t}</Pill>
              ))}
            </div>
            <IMEInput
              type="text" placeholder="例: カレーうどんと唐揚げ"
              value={mealDraft.text}
              onChange={(v) => setMealDraft((d) => ({ ...d, text: v }))}
              style={{
                width: "100%", padding: "12px 14px", borderRadius: 12, border: `1px solid ${theme.border}`,
                background: "rgba(255,255,255,0.04)", color: theme.text, fontSize: 15, marginBottom: 14,
                outline: "none", boxSizing: "border-box" as const,
              }}
              autoFocus
            />
            <div style={{ fontSize: 11, color: theme.textSub, marginBottom: 8, fontWeight: 600 }}>タグ（該当するものを選択）</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
              {FOOD_TAGS.map((t) => (
                <Pill key={t} active={mealDraft.tags.includes(t)}
                  onClick={() => setMealDraft((d) => ({ ...d, tags: d.tags.includes(t) ? d.tags.filter((x) => x !== t) : [...d.tags, t] }))}
                  color={theme.orange} softColor={theme.orangeSoft}>{t}</Pill>
              ))}
            </div>
            <button
              onClick={() => { if (!mealDraft.text.trim()) return; updateRecord("meals", [...currentRecord.meals, { ...mealDraft }]); setShowMealModal(false); }}
              style={{ width: "100%", padding: 14, borderRadius: 14, border: "none", background: theme.accent, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}
            >
              追加する
            </button>
          </div>
        </div>
      )}

      {/* Med Form Modal */}
      {showMedForm && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowMedForm(false); }}
        >
          <div style={{ width: "100%", maxWidth: 480, background: theme.card, borderRadius: "20px 20px 0 0", padding: "20px 18px 32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: theme.text }}>{editingMedId ? "薬を編集" : "薬を追加"}</span>
              <button onClick={() => setShowMedForm(false)} style={{ background: "none", border: "none", color: theme.textSub, fontSize: 20, cursor: "pointer" }}>×</button>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: theme.textSub, marginBottom: 6, fontWeight: 600 }}>薬の名前 *</div>
              <IMEInput type="text" placeholder="例: メサラジン" value={medDraft.name} onChange={(v) => setMedDraft((d) => ({ ...d, name: v }))}
                style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1px solid ${theme.border}`, background: "rgba(255,255,255,0.04)", color: theme.text, fontSize: 15, outline: "none", boxSizing: "border-box" as const }}
                autoFocus />
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: theme.textSub, marginBottom: 6, fontWeight: 600 }}>用量（任意）</div>
              <IMEInput type="text" placeholder="例: 1000mg" value={medDraft.dosage} onChange={(v) => setMedDraft((d) => ({ ...d, dosage: v }))}
                style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1px solid ${theme.border}`, background: "rgba(255,255,255,0.04)", color: theme.text, fontSize: 15, outline: "none", boxSizing: "border-box" as const }} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {editingMedId && (
                <button
                  onClick={async () => { const updated = medications.filter((m) => m.id !== editingMedId); 
                    setMedications(updated); 
                    await saveMedications(updated); 
                    setShowMedForm(false); 
                    showToast("削除しました"); 
                  }}
                  style={{ padding: "14px 20px", borderRadius: 14, border: `1px solid ${theme.red}`, background: theme.redSoft, color: theme.red, fontSize: 14, cursor: "pointer", fontWeight: 600 }}
                >
                  削除
                </button>
              )}
              <button
                onClick={async () => {
                  if (!medDraft.name.trim()) return;
                  let updated: Medication[];
                  if (editingMedId) {
                    updated = medications.map((m) => m.id === editingMedId ? { ...m, name: medDraft.name.trim(), dosage: medDraft.dosage.trim() } : m);
                  } else {
                    const newMed: Medication = { id: `med_${Date.now()}`, name: medDraft.name.trim(), dosage: medDraft.dosage.trim() };
                    updated = [...medications, newMed];
                    updateRecord("meds", { ...currentRecord.meds, [newMed.id]: false });
                  }
                  setMedications(updated);
                  await saveMedications(updated);
                  setShowMedForm(false);
                  showToast(editingMedId ? "更新しました" : "追加しました");
                }}
                style={{ flex: 1, padding: 14, borderRadius: 14, border: "none", background: theme.accent, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}
              >
                {editingMedId ? "更新する" : "追加する"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 60, left: "50%", transform: "translateX(-50%)",
          padding: "10px 24px", borderRadius: 12, background: theme.green, color: "#fff",
          fontSize: 14, fontWeight: 700, zIndex: 300, boxShadow: "0 4px 20px rgba(78,203,160,0.4)",
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}
