"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { recordStepwiseResult } from "@/lib/stepwise/actions";
import type { StepwiseSentence } from "@/lib/stepwise/select";
import TappableText, { type Segment } from "@/components/TappableText";
import SpeakButton from "@/components/SpeakButton";
import PronunciationCheck from "@/components/PronunciationCheck";

type Item = { sentence: StepwiseSentence; segments: Segment[] };
type Answer = { sentence: StepwiseSentence; correct: boolean };

// PronunciationCheckの一致度がこの値以上なら「正解」としてrecordStepwiseResultに記録する
// (85%以上=とても良い、60%以上=惜しい、を踏まえ「惜しい」以上を合格ラインとした)
const PASS_THRESHOLD = 60;

function StarIcon({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l2.2 5.6 6 .5-4.6 3.9 1.5 5.8L12 15.9l-5.1 2.9 1.5-5.8-4.6-3.9 6-.5z" />
    </svg>
  );
}

function SmallStarIcon() {
  return (
    <svg viewBox="0 0 24 24" width={14} height={14} fill="currentColor" aria-hidden="true">
      <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.7 7-6.3-3.9-6.3 3.9 1.7-7L2 9.2l7.1-.6z" />
    </svg>
  );
}

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="var(--ink)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="white" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 5l7 7-7 7" />
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

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="var(--match-green)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="var(--miss-red)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

export default function StudySession({ items }: { items: Item[] }) {
  const router = useRouter();
  const [phase, setPhase] = useState<"intro" | "quiz" | "result">("intro");
  const [index, setIndex] = useState(0);
  const [pct, setPct] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);

  const total = items.length;
  const current = items[index];
  const isLast = index === total - 1;

  function handleResult(score: number) {
    setPct(score);
  }

  function handleNext() {
    if (pct === null) return;
    const correct = pct >= PASS_THRESHOLD;
    void recordStepwiseResult(current.sentence.id, correct);
    setAnswers((prev) => [...prev, { sentence: current.sentence, correct }]);
    setPct(null);
    if (isLast) {
      setPhase("result");
    } else {
      setIndex((i) => i + 1);
    }
  }

  function handleRestart() {
    router.refresh();
  }

  if (phase === "intro") {
    return (
      <main style={{ maxWidth: 480, margin: "0 auto", padding: "24px 16px 40px", textAlign: "center" }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "var(--grad)",
            boxShadow: "0 10px 24px rgba(0,0,0,0.16)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <StarIcon />
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", marginBottom: 8 }}>今日の復習</h1>

        <p style={{ fontSize: 13, color: "var(--ink-soft)", maxWidth: 280, margin: "0 auto 20px", lineHeight: 1.7 }}>
          進捗データをもとに、今のあなたに合った例文を{total}問用意しました
        </p>

        <div
          style={{
            background: "#fff",
            borderRadius: 22,
            boxShadow: "0 6px 20px rgba(0,0,0,0.07)",
            padding: "20px 20px",
            marginBottom: 20,
          }}
        >
          {/* sentencesテーブルには「文法/量詞」等の一貫したカテゴリ分類が無いため、
              モックの3分割内訳ボックスは実データが無く実装せず、件数のみの1行に簡略化している */}
          <p style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>
            今日は{total}文の例文が用意されています
          </p>
          <p style={{ fontSize: 11, color: "var(--ink-soft)" }}>発音の練習も交えながら復習しましょう</p>
        </div>

        <button
          type="button"
          onClick={() => setPhase("quiz")}
          style={{
            width: "100%",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            background: "var(--grad)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            border: "none",
            borderRadius: 999,
            padding: "13px 0",
            boxShadow: "0 8px 20px rgba(0,0,0,0.14)",
            cursor: "pointer",
          }}
        >
          <SmallStarIcon />
          問題をはじめる
        </button>
      </main>
    );
  }

  if (phase === "result") {
    const correctCount = answers.filter((a) => a.correct).length;
    const scorePct = Math.round((correctCount / total) * 100);
    const comment = scorePct >= 80 ? "いい調子です！" : "もう少し復習しましょう";

    return (
      <main style={{ maxWidth: 480, margin: "0 auto", padding: "24px 16px 40px" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div
            style={{
              fontSize: 52,
              fontWeight: 800,
              background: "var(--grad)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              lineHeight: 1.1,
            }}
          >
            {scorePct}%
          </div>
          <p style={{ fontSize: 14, color: "var(--ink-soft)", marginTop: 4 }}>
            {total}問中 <span style={{ fontWeight: 700, color: "var(--ink)" }}>{correctCount}問</span> 正解
          </p>
          <p style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 4 }}>{comment}</p>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: 22,
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
            padding: "4px 16px",
            marginBottom: 20,
          }}
        >
          {answers.map((a, i) => (
            <div
              key={a.sentence.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 0",
                borderTop: i === 0 ? "none" : "1px solid var(--line)",
              }}
            >
              {a.correct ? <CheckIcon /> : <CrossIcon />}
              <span
                style={{
                  flexShrink: 0,
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#fff",
                  background: "var(--grad)",
                  borderRadius: 6,
                  padding: "2px 6px",
                }}
              >
                HSK{a.sentence.hsk_level}
              </span>
              <span
                style={{
                  fontSize: 13,
                  color: "var(--ink)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {a.sentence.hanzi}
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={handleRestart}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              background: "#fff",
              border: "1px solid var(--line)",
              borderRadius: 999,
              padding: "12px 0",
              fontSize: 13,
              fontWeight: 700,
              color: "var(--ink)",
              cursor: "pointer",
            }}
          >
            <RewindIcon />
            もう一度
          </button>
          <Link
            href="/"
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--grad)",
              borderRadius: 999,
              padding: "12px 0",
              fontSize: 13,
              fontWeight: 700,
              color: "#fff",
              textDecoration: "none",
            }}
          >
            ホームへ
          </Link>
        </div>
      </main>
    );
  }

  // phase === "quiz"
  const progressPct = Math.round(((index + 1) / total) * 100);

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "16px 16px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <Link
          href="/"
          aria-label="トップに戻る"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            flexShrink: 0,
          }}
        >
          <BackArrowIcon />
        </Link>
        <div
          style={{
            flex: 1,
            height: 6,
            borderRadius: 999,
            background: "var(--line)",
            overflow: "hidden",
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
        <span style={{ fontSize: 11, color: "var(--ink-soft)", flexShrink: 0 }}>
          {index + 1} / {total}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span
          style={{
            flexShrink: 0,
            fontSize: 11,
            fontWeight: 700,
            color: "#fff",
            background: "var(--grad)",
            borderRadius: 6,
            padding: "3px 10px",
          }}
        >
          HSK{current.sentence.hsk_level}
        </span>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: 22,
          boxShadow: "0 6px 20px rgba(0,0,0,0.07)",
          padding: "22px 20px",
          marginBottom: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <TappableText segments={current.segments} fontSize={17} lineHeight={1.8} />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <SpeakButton text={current.sentence.hanzi} size={30} />
          <PronunciationCheck
            key={current.sentence.id}
            target={current.sentence.hanzi}
            pinyin={current.sentence.pinyin}
            onResult={handleResult}
          />
          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-soft)" }}>{current.sentence.pinyin}</span>
        </div>
      </div>

      {pct !== null && (
        <div
          style={{
            background: "#fff",
            borderRadius: 14,
            boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
            padding: "14px 16px",
            marginBottom: 14,
          }}
        >
          {pct >= PASS_THRESHOLD ? (
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>
              よくできました！({pct}%)
            </p>
          ) : (
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>
              もう少し練習してみましょう({pct}%)
            </p>
          )}
          {current.sentence.meaning_ja && (
            <p style={{ fontSize: 12, color: "var(--ink-soft)" }}>{current.sentence.meaning_ja}</p>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={handleNext}
        disabled={pct === null}
        style={{
          width: "100%",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          background: "var(--grad)",
          color: "#fff",
          fontWeight: 700,
          fontSize: 14,
          border: "none",
          borderRadius: 999,
          padding: "13px 0",
          opacity: pct === null ? 0.4 : 1,
          cursor: pct === null ? "default" : "pointer",
        }}
      >
        {isLast ? "結果を見る" : "次の例文"}
        <ArrowRightIcon />
      </button>
    </main>
  );
}
