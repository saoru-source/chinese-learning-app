"use client";

import { useState } from "react";
import Link from "next/link";

type Question = {
  id: number;
  hsk_level: number;
  words_shuffled: string[];
  correct_sentence: string;
  meaning_ja: string | null;
};

export default function ScrambleCard({
  question,
  nextHref,
}: {
  question: Question;
  nextHref: string;
}) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div
      style={{
        background: "var(--card)",
        borderRadius: 22,
        boxShadow: "0 6px 20px rgba(0,0,0,0.07)",
        padding: "26px 20px",
        textAlign: "center",
      }}
    >
      <span
        style={{
          display: "inline-block",
          background: "var(--paper-deep)",
          color: "var(--ink)",
          fontSize: 10,
          fontWeight: 700,
          borderRadius: 20,
          padding: "3px 12px",
          marginBottom: 18,
        }}
      >
        HSK{question.hsk_level}
      </span>

      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, marginBottom: 22 }}>
        {question.words_shuffled.map((w, i) => (
          <span
            key={i}
            style={{
              background: "var(--paper-deep)",
              border: "1px solid var(--line)",
              borderRadius: 12,
              padding: "9px 14px",
              fontSize: 17,
              color: "var(--ink)",
            }}
          >
            {w}
          </span>
        ))}
      </div>

      {!revealed ? (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          style={{
            background: "var(--grad)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            border: "none",
            borderRadius: 999,
            padding: "12px 32px",
            cursor: "pointer",
          }}
        >
          答えを見る
        </button>
      ) : (
        <>
          <p style={{ fontSize: 18, color: "var(--ink)", marginBottom: 6 }}>{question.correct_sentence}</p>
          {question.meaning_ja && (
            <p style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 20 }}>{question.meaning_ja}</p>
          )}
          <Link
            href={nextHref}
            style={{
              display: "inline-block",
              background: "var(--grad)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              borderRadius: 999,
              padding: "12px 32px",
              textDecoration: "none",
            }}
          >
            次の問題へ
          </Link>
        </>
      )}
    </div>
  );
}
