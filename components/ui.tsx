"use client";

import { CSSProperties, ReactNode } from "react";
import { theme } from "@/lib/constants";

// ── Pill Button ──
interface PillProps {
  active: boolean;
  color?: string;
  softColor?: string;
  children: ReactNode;
  onClick: () => void;
  style?: CSSProperties;
}

export function Pill({ active, color, softColor, children, onClick, style }: PillProps) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 14px",
        borderRadius: 20,
        border: "none",
        background: active ? (softColor || theme.accentSoft) : "rgba(255,255,255,0.04)",
        color: active ? (color || theme.accent) : theme.textMuted,
        fontWeight: active ? 700 : 500,
        fontSize: 13,
        cursor: "pointer",
        transition: "all 0.15s",
        letterSpacing: 0.3,
        boxShadow: active ? `0 0 12px ${softColor || theme.accentGlow}` : "none",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// ── Section Card ──
interface SectionCardProps {
  title?: string;
  icon?: string;
  children: ReactNode;
  style?: CSSProperties;
}

export function SectionCard({ title, icon, children, style }: SectionCardProps) {
  return (
    <div
      style={{
        background: theme.card,
        borderRadius: 16,
        padding: "16px 18px",
        marginBottom: 12,
        border: `1px solid ${theme.border}`,
        ...style,
      }}
    >
      {title && (
        <div
          style={{
            fontSize: 12,
            color: theme.textSub,
            marginBottom: 10,
            fontWeight: 600,
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          {icon} {title}
        </div>
      )}
      {children}
    </div>
  );
}

// ── Counter ──
interface CounterProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function Counter({ value, onChange, min = 0, max = 20 }: CounterProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        style={{
          width: 44, height: 44, borderRadius: 12,
          border: `1px solid ${theme.border}`,
          background: theme.card, color: theme.text,
          fontSize: 22, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        −
      </button>
      <span style={{ fontSize: 32, fontWeight: 800, color: theme.text, minWidth: 40, textAlign: "center" }}>
        {value}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        style={{
          width: 44, height: 44, borderRadius: 12, border: "none",
          background: theme.accent, color: "#fff",
          fontSize: 22, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        +
      </button>
    </div>
  );
}

// ── Score Slider ──
interface ScoreSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function ScoreSlider({ value, onChange, min = 1, max = 10 }: ScoreSliderProps) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: value <= 3 ? theme.red : value <= 6 ? theme.orange : theme.green,
          }}
        >
          {value}
        </span>
        <span style={{ fontSize: 12, color: theme.textMuted }}>/ {max}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: "100%",
          background: `linear-gradient(90deg, ${theme.red}, ${theme.orange}, ${theme.green})`,
        }}
      />
    </div>
  );
}
