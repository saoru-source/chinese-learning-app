"use client";

import { useLevel } from "@/lib/level/LevelContext";

type GrammarPoint = { id: number; hsk_level: number; label: string; explanation: string | null };

export default function GrammarDictionaryList({ points }: { points: GrammarPoint[] }) {
  const { levelKey } = useLevel();
  const filtered = points.filter((p) => p.hsk_level === levelKey);

  return (
    <div>
      <p style={{ fontSize: 14.4, color: "var(--ink-soft)", marginBottom: 12 }}>
        HSK{levelKey} · {filtered.length}件
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map((p) => (
          <div
            key={p.id}
            style={{
              background: "var(--card)",
              borderRadius: 16,
              padding: "14px 16px",
              boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)" }}>{p.label}</span>
              <span
                style={{
                  flexShrink: 0,
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#fff",
                  background: "var(--grad)",
                  borderRadius: 999,
                  padding: "2px 8px",
                }}
              >
                HSK{p.hsk_level}
              </span>
            </div>
            {p.explanation && <p style={{ fontSize: 15.6, color: "var(--ink-soft)" }}>{p.explanation}</p>}
          </div>
        ))}
        {filtered.length === 0 && (
          <p style={{ fontSize: 15.6, color: "var(--ink-soft)" }}>このレベルの文法項目はまだありません。</p>
        )}
      </div>
    </div>
  );
}
