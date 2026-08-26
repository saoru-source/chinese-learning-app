"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLevel } from "@/lib/level/LevelContext";
import { getGrammarWritingList } from "@/lib/writing/actions";
import type { WritingGrammarPoint } from "@/lib/writing/select";

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="var(--ink-soft)" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export default function GrammarWritingList() {
  const { levelKey } = useLevel();
  const [points, setPoints] = useState<WritingGrammarPoint[]>([]);
  const [loadedLevel, setLoadedLevel] = useState<number | null>(null);
  const loading = loadedLevel !== levelKey;

  useEffect(() => {
    let cancelled = false;
    getGrammarWritingList(levelKey).then((result) => {
      if (cancelled) return;
      setPoints(result);
      setLoadedLevel(levelKey);
    });
    return () => {
      cancelled = true;
    };
  }, [levelKey]);

  return (
    <div>
      <p style={{ fontSize: 14.4, color: "var(--ink-soft)", marginBottom: 12 }}>
        HSK{levelKey} · {points.length}件
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, opacity: loading ? 0.5 : 1, transition: "opacity 0.15s ease" }}>
        {points.map((p) => (
          <Link
            key={p.id}
            href={`/writing/grammar/${p.id}`}
            className="active:scale-[0.98] transition-transform"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "var(--card)",
              borderRadius: 15,
              padding: "13px 16px",
              boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
              textDecoration: "none",
            }}
          >
            <span
              style={{
                flexShrink: 0,
                fontSize: 12,
                fontWeight: 700,
                color: "var(--ink)",
                background: "var(--paper-deep)",
                borderRadius: 20,
                padding: "3px 9px",
              }}
            >
              HSK{p.hsk_level}
            </span>
            <span style={{ flex: 1, fontSize: 15.6, color: "var(--ink)", lineHeight: 1.5 }}>{p.label}</span>
            <ChevronRightIcon />
          </Link>
        ))}
        {!loading && points.length === 0 && (
          <p style={{ fontSize: 14.4, color: "var(--ink-soft)" }}>このレベルの文法項目はまだありません。</p>
        )}
      </div>
    </div>
  );
}
