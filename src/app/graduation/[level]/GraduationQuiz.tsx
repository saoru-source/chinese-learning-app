"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { recordGraduationAttempt } from "@/lib/graduation/actions";
import { PASS_SCORE, type GraduationQuestion } from "@/lib/graduation/select";

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="var(--ink)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}

function RewindIcon() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="var(--ink)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
    </svg>
  );
}

const KIND_LABEL: Record<GraduationQuestion["kind"], string> = {
  word: "単語",
  grammar: "文法",
};

export default function GraduationQuiz({
  hskLevel,
  questions,
}: {
  hskLevel: number;
  questions: GraduationQuestion[];
}) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<"quiz" | "result">("quiz");
  const [saving, setSaving] = useState(false);
  const [passed, setPassed] = useState(false);

  const total = questions.length;
  const current = questions[index];
  const isLast = index === total - 1;

  function handleSelect(choiceIndex: number) {
    if (selected !== null) return;
    setSelected(choiceIndex);
    if (choiceIndex === current.correctIndex) {
      setScore((s) => s + 1);
    }
  }

  async function handleNext() {
    if (!isLast) {
      setSelected(null);
      setIndex((i) => i + 1);
      return;
    }

    setSaving(true);
    const result = await recordGraduationAttempt(hskLevel, score, total);
    setSaving(false);
    setPassed(result.passed);
    setPhase("result");
  }

  function handleRetry() {
    router.refresh();
  }

  if (phase === "result") {
    return (
      <main style={{ maxWidth: 480, margin: "0 auto", padding: "24px 16px 40px", textAlign: "center" }}>
        <p style={{ fontSize: 14.4, fontWeight: 700, color: "var(--ink-soft)", marginBottom: 8 }}>
          HSK{hskLevel} 卒業試験
        </p>
        <div
          style={{
            fontSize: 62.4,
            fontWeight: 800,
            background: "var(--grad)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            lineHeight: 1.1,
          }}
        >
          {score}/{total}
        </div>
        <p
          style={{
            fontSize: 19.2,
            fontWeight: 700,
            color: passed ? "var(--match-green)" : "var(--miss-red)",
            marginTop: 8,
            marginBottom: 24,
          }}
        >
          {passed ? `合格！（${PASS_SCORE}問以上正解）` : "不合格。もう一度挑戦できます"}
        </p>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={handleRetry}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              background: "var(--card)",
              border: "1px solid var(--line)",
              borderRadius: 999,
              padding: "12px 0",
              fontSize: 15.6,
              fontWeight: 700,
              color: "var(--ink)",
              cursor: "pointer",
            }}
          >
            <RewindIcon />
            もう一度挑戦する
          </button>
          <Link
            href="/graduation"
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--grad)",
              borderRadius: 999,
              padding: "12px 0",
              fontSize: 15.6,
              fontWeight: 700,
              color: "#fff",
              textDecoration: "none",
            }}
          >
            卒業試験一覧へ
          </Link>
        </div>
      </main>
    );
  }

  const progressPct = Math.round(((index + (selected !== null ? 1 : 0)) / total) * 100);

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "16px 16px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <Link
          href="/graduation"
          aria-label="卒業試験一覧に戻る"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: "var(--card)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            flexShrink: 0,
          }}
        >
          <BackArrowIcon />
        </Link>
        <span style={{ fontSize: 14.4, fontWeight: 700, color: "var(--ink-soft)" }}>
          HSK{hskLevel} 卒業試験
        </span>
        <span style={{ marginLeft: "auto", fontSize: 14.4, color: "var(--ink-soft)" }}>
          {index + 1} / {total} 問
        </span>
      </div>

      <div
        style={{
          height: 6,
          borderRadius: 999,
          background: "var(--line)",
          overflow: "hidden",
          marginBottom: 18,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progressPct}%`,
            background: "var(--grad)",
            borderRadius: 999,
            transition: "width 0.3s ease",
          }}
        />
      </div>

      <div
        style={{
          background: "var(--card)",
          borderRadius: 22,
          boxShadow: "0 6px 20px rgba(0,0,0,0.07)",
          padding: "26px 20px",
          textAlign: "center",
          marginBottom: 16,
        }}
      >
        <span
          style={{
            display: "inline-block",
            fontSize: 11,
            fontWeight: 700,
            color: "var(--ink-soft)",
            background: "var(--paper-deep)",
            borderRadius: 999,
            padding: "2px 10px",
            marginBottom: 12,
          }}
        >
          {KIND_LABEL[current.kind]}
        </span>
        <p
          style={{
            fontSize: current.kind === "word" ? 40.8 : 22.8,
            fontWeight: 700,
            color: "var(--ink)",
            marginBottom: 20,
            lineHeight: 1.4,
          }}
        >
          {current.prompt}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {current.choices.map((choice, i) => {
            const showResult = selected !== null;
            const isCorrect = i === current.correctIndex;
            const isSelected = i === selected;

            const background = showResult && isCorrect
              ? "var(--match-green)"
              : showResult && isSelected
                ? "color-mix(in srgb, var(--miss-red) 15%, var(--card))"
                : "var(--paper-deep)";
            const color = showResult && isCorrect ? "#fff" : showResult && isSelected ? "var(--miss-red)" : "var(--ink)";

            return (
              <button
                key={i}
                type="button"
                disabled={showResult}
                onClick={() => handleSelect(i)}
                style={{
                  borderRadius: 13,
                  padding: "12px 10px",
                  fontSize: 14.4,
                  fontWeight: 700,
                  background,
                  color,
                  border: "none",
                  cursor: showResult ? "default" : "pointer",
                }}
              >
                {choice}
              </button>
            );
          })}
        </div>

        {selected !== null && (
          <p
            style={{
              marginTop: 14,
              fontSize: 14.4,
              fontWeight: 700,
              color: selected === current.correctIndex ? "var(--match-green)" : "var(--miss-red)",
            }}
          >
            {selected === current.correctIndex
              ? "✓ 正解！"
              : `✗ 不正解。正解は「${current.choices[current.correctIndex]}」でした。`}
          </p>
        )}
      </div>

      <button
        type="button"
        disabled={selected === null || saving}
        onClick={handleNext}
        style={{
          width: "100%",
          background: "var(--grad)",
          color: "#fff",
          fontWeight: 700,
          fontSize: 16.8,
          border: "none",
          borderRadius: 999,
          padding: "13px 0",
          opacity: selected === null || saving ? 0.4 : 1,
          cursor: selected === null || saving ? "default" : "pointer",
        }}
      >
        {saving ? "記録中…" : isLast ? "結果を見る" : "次の問題へ"}
      </button>
    </main>
  );
}
