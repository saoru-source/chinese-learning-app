"use client";

import Link from "next/link";
import { useState } from "react";
import { useLevel } from "@/lib/level/LevelContext";

type Passage = { id: number; hsk_level: number; title: string; body: string };

const LEVEL_DOT: Record<number, string> = {
  4: "var(--jade)",
  5: "var(--seal)",
  6: "var(--lavender)",
};
const LEVEL_BADGE_BG: Record<number, string> = {
  4: "linear-gradient(135deg, var(--jade), var(--jade-deep))",
  5: "var(--grad)",
  6: "linear-gradient(135deg, var(--lavender), var(--seal-deep))",
};

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="var(--ink-soft)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export default function ReadingTabs({ passages }: { passages: Passage[] }) {
  const { levelKey } = useLevel();

  const availableLevels = Array.from(new Set(passages.map((p) => p.hsk_level))).sort((a, b) => a - b);

  // アプリ全体のレベルが4〜6級の範囲内ならその級、範囲外(1〜3級)ならHSK4を
  // デフォルトにする。タブ切り替えはこの画面内だけのローカルな状態で、
  // アプリ全体のレベル切替(useLevel)は変更しない。
  const preferredDefault = levelKey >= 4 && levelKey <= 6 ? levelKey : 4;
  const initialLevel = availableLevels.includes(preferredDefault)
    ? preferredDefault
    : (availableLevels[0] ?? preferredDefault);

  const [activeLevel, setActiveLevel] = useState(initialLevel);

  const levelPassages = passages.filter((p) => p.hsk_level === activeLevel);

  return (
    <div>
      <div
        style={{
          display: "flex",
          background: "var(--paper-deep)",
          borderRadius: 999,
          padding: 4,
          marginBottom: 12,
        }}
      >
        {availableLevels.map((level) => {
          const active = level === activeLevel;
          return (
            <button
              key={level}
              type="button"
              onClick={() => setActiveLevel(level)}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "8px 0",
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                fontSize: 14.4,
                fontWeight: active ? 700 : 400,
                color: active ? "var(--ink)" : "var(--ink-soft)",
                background: active ? "var(--card)" : "transparent",
                boxShadow: active ? "0 2px 6px rgba(0,0,0,0.08)" : "none",
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: LEVEL_DOT[level], flexShrink: 0 }} />
              HSK{level}級
            </button>
          );
        })}
      </div>

      <p style={{ fontSize: 13.2, color: "var(--ink-soft)", marginBottom: 10 }}>
        HSK{activeLevel}級 ・ {levelPassages.length}本
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {levelPassages.map((p) => (
          <Link
            key={p.id}
            href={`/reading/${p.id}`}
            className="active:scale-[0.98] transition-transform"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "var(--card)",
              borderRadius: 16,
              padding: "12px 14px",
              boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
              textDecoration: "none",
            }}
          >
            <div
              style={{
                flexShrink: 0,
                width: 32,
                height: 32,
                borderRadius: 10,
                background: LEVEL_BADGE_BG[p.hsk_level],
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 700,
                fontSize: 14.4,
              }}
            >
              {p.hsk_level}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 15.6, fontWeight: 700, color: "var(--ink)" }}>{p.title}</p>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--ink-soft)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {p.body.slice(0, 20)}… ・ 約{p.body.length}字
              </p>
            </div>
            <ChevronRightIcon />
          </Link>
        ))}
      </div>
    </div>
  );
}
