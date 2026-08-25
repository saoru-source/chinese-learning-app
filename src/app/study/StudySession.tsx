"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { recordNewWordLearned } from "@/lib/stepwise/actions";
import { recordWordPronunciationResult } from "@/lib/words/pronunciationActions";
import type { NewWord } from "@/lib/stepwise/select";
import type { Segment } from "@/components/TappableText";
import TappableText from "@/components/TappableText";
import SpeakButton from "@/components/SpeakButton";
import PronunciationCheck from "@/components/PronunciationCheck";
import PosBadge from "@/components/PosBadge";

type Item = {
  word: NewWord;
  example: { hanzi: string; pinyin: string | null; meaning_ja: string | null } | null;
  exampleSegments: Segment[] | null;
};

type Stage = 1 | 2 | 3 | 4;
const STAGE_ORDER: Stage[] = [1, 2, 3, 4];
const STAGE_LABELS: Record<Stage, string> = {
  1: "見る",
  2: "思い出す",
  3: "発音する",
  4: "使う",
};

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

export default function StudySession({ items }: { items: Item[] }) {
  const router = useRouter();
  const [phase, setPhase] = useState<"intro" | "session" | "result">("intro");
  const [wordIndex, setWordIndex] = useState(0);
  const [stage, setStage] = useState<Stage>(1);
  const [revealed, setRevealed] = useState(false);
  const [learned, setLearned] = useState<NewWord[]>([]);
  const [saving, setSaving] = useState(false);

  const total = items.length;
  const current = items[wordIndex];
  const isLastWord = wordIndex === total - 1;

  async function handleWordComplete() {
    setSaving(true);
    await recordNewWordLearned(current.word.id);
    setSaving(false);
    setLearned((prev) => [...prev, current.word]);
    setRevealed(false);
    if (isLastWord) {
      setPhase("result");
    } else {
      setWordIndex((i) => i + 1);
      setStage(1);
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

        <h1 style={{ fontSize: 26.4, fontWeight: 800, color: "var(--ink)", marginBottom: 8 }}>段階的暗記</h1>

        <p style={{ fontSize: 15.6, color: "var(--ink-soft)", maxWidth: 280, margin: "0 auto 20px", lineHeight: 1.7 }}>
          まだ覚えていない新しい単語を{total}語、4つのステップで少しずつ覚えていきます
        </p>

        <div
          style={{
            background: "var(--card)",
            borderRadius: 22,
            boxShadow: "0 6px 20px rgba(0,0,0,0.07)",
            padding: "20px 20px",
            marginBottom: 20,
            textAlign: "left",
          }}
        >
          {STAGE_ORDER.map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
              <span
                style={{
                  flexShrink: 0,
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "var(--grad)",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {i + 1}
              </span>
              <span style={{ fontSize: 15.6, fontWeight: 700, color: "var(--ink)" }}>{STAGE_LABELS[s]}</span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setPhase("session")}
          style={{
            width: "100%",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            background: "var(--grad)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 16.8,
            border: "none",
            borderRadius: 999,
            padding: "13px 0",
            boxShadow: "0 8px 20px rgba(0,0,0,0.14)",
            cursor: "pointer",
          }}
        >
          <SmallStarIcon />
          はじめる
        </button>
      </main>
    );
  }

  if (phase === "result") {
    return (
      <main style={{ maxWidth: 480, margin: "0 auto", padding: "24px 16px 40px" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
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
            {learned.length}語
          </div>
          <p style={{ fontSize: 16.8, color: "var(--ink-soft)", marginTop: 4 }}>新しい単語を覚えました！</p>
        </div>

        <div
          style={{
            background: "var(--card)",
            borderRadius: 22,
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
            padding: "4px 16px",
            marginBottom: 20,
          }}
        >
          {learned.map((w, i) => (
            <div
              key={w.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 0",
                borderTop: i === 0 ? "none" : "1px solid var(--line)",
              }}
            >
              <CheckIcon />
              <span
                style={{
                  flexShrink: 0,
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#fff",
                  background: "var(--grad)",
                  borderRadius: 6,
                  padding: "2px 6px",
                }}
              >
                HSK{w.hsk_level}
              </span>
              <span style={{ fontSize: 15.6, fontWeight: 700, color: "var(--ink)" }}>{w.hanzi}</span>
              <PosBadge type={w.word_type} fontSize={11} />
              <span
                style={{
                  fontSize: 13.2,
                  color: "var(--ink-soft)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {w.meaning_ja}
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
            続けて学ぶ
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
              fontSize: 15.6,
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

  // phase === "session"
  const overallProgress = (wordIndex * 4 + (stage - 1)) / (total * 4);
  const progressPct = Math.round(overallProgress * 100);
  const nextDisabled = saving;

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
            background: "var(--card)",
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
        <span style={{ fontSize: 13.2, color: "var(--ink-soft)", flexShrink: 0 }}>
          単語 {wordIndex + 1}/{total}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
        <span
          style={{
            flexShrink: 0,
            fontSize: 13.2,
            fontWeight: 700,
            color: "#fff",
            background: "var(--grad)",
            borderRadius: 6,
            padding: "3px 10px",
          }}
        >
          HSK{current.word.hsk_level}
        </span>
        {STAGE_ORDER.map((s) => (
          <span
            key={s}
            style={{
              fontSize: 12,
              fontWeight: 700,
              padding: "3px 9px",
              borderRadius: 999,
              color: s === stage ? "#fff" : "var(--ink-soft)",
              background: s === stage ? "var(--grad)" : "var(--paper-deep)",
            }}
          >
            {s}.{STAGE_LABELS[s]}
          </span>
        ))}
      </div>

      <div
        style={{
          background: "var(--card)",
          borderRadius: 22,
          boxShadow: "0 6px 20px rgba(0,0,0,0.07)",
          padding: "26px 20px",
          marginBottom: 14,
          textAlign: "center",
        }}
      >
        {stage === 1 && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 4 }}>
              <SpeakButton text={current.word.hanzi} size={32} layout="column" />
              <span style={{ fontSize: 40.8, fontWeight: 700, color: "var(--ink)" }}>{current.word.hanzi}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 6 }}>
              <p style={{ fontSize: 15.6, fontWeight: 500, color: "var(--ink-soft)" }}>{current.word.pinyin}</p>
              <PosBadge type={current.word.word_type} />
            </div>
            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 6, marginTop: 6 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-soft)", marginBottom: 2 }}>意味</p>
              <p style={{ fontSize: 19.2, fontWeight: 700, color: "var(--ink)" }}>{current.word.meaning_ja}</p>
            </div>
          </>
        )}

        {stage === 2 && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 10 }}>
              <SpeakButton text={current.word.hanzi} size={32} layout="column" />
              <span style={{ fontSize: 40.8, fontWeight: 700, color: "var(--ink)" }}>{current.word.hanzi}</span>
            </div>
            {!revealed ? (
              <p style={{ fontSize: 13.2, color: "var(--ink-soft)" }}>
                ピンインと意味を思い出せますか？
              </p>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 6 }}>
                  <p style={{ fontSize: 15.6, fontWeight: 500, color: "var(--ink-soft)" }}>{current.word.pinyin}</p>
                  <PosBadge type={current.word.word_type} />
                </div>
                <div style={{ borderTop: "1px solid var(--line)", paddingTop: 6, marginTop: 6 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-soft)", marginBottom: 2 }}>意味</p>
                  <p style={{ fontSize: 19.2, fontWeight: 700, color: "var(--ink)" }}>{current.word.meaning_ja}</p>
                </div>
              </>
            )}
          </>
        )}

        {stage === 3 && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 4 }}>
              <SpeakButton text={current.word.hanzi} size={32} layout="column" />
              <span style={{ fontSize: 40.8, fontWeight: 700, color: "var(--ink)" }}>{current.word.hanzi}</span>
              <PronunciationCheck
                key={current.word.id}
                target={current.word.hanzi}
                pinyin={current.word.pinyin}
                onResult={recordWordPronunciationResult.bind(null, current.word.id)}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <p style={{ fontSize: 15.6, fontWeight: 500, color: "var(--ink-soft)" }}>{current.word.pinyin}</p>
              <PosBadge type={current.word.word_type} />
            </div>
            <p style={{ fontSize: 13.2, color: "var(--ink-soft)", marginTop: 10 }}>
              マイクボタンを押して、実際に発音してみましょう
            </p>
          </>
        )}

        {stage === 4 && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 24, fontWeight: 700, color: "var(--ink)" }}>{current.word.hanzi}</span>
              <span style={{ fontSize: 13.2, color: "var(--ink-soft)" }}>{current.word.meaning_ja}</span>
              <PosBadge type={current.word.word_type} />
            </div>
            {current.example && current.exampleSegments ? (
              <div style={{ textAlign: "left" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <TappableText segments={current.exampleSegments} fontSize={19.2} lineHeight={1.7} />
                  </div>
                  <SpeakButton text={current.example.hanzi} size={26} />
                </div>
                <p style={{ fontSize: 13.2, color: "var(--ink-soft)", fontWeight: 500, marginTop: 8 }}>
                  {current.example.pinyin}
                </p>
                <p style={{ fontSize: 15.6, color: "var(--ink)", marginTop: 4 }}>{current.example.meaning_ja}</p>
              </div>
            ) : (
              <p style={{ fontSize: 13.2, color: "var(--ink-soft)" }}>
                この単語を使った例文はまだ見つかりませんでした。
              </p>
            )}
          </>
        )}
      </div>

      <button
        type="button"
        disabled={nextDisabled}
        onClick={() => {
          if (stage === 1) {
            setStage(2);
          } else if (stage === 2) {
            if (!revealed) {
              setRevealed(true);
            } else {
              setRevealed(false);
              setStage(3);
            }
          } else if (stage === 3) {
            setStage(4);
          } else {
            void handleWordComplete();
          }
        }}
        style={{
          width: "100%",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          background: "var(--grad)",
          color: "#fff",
          fontWeight: 700,
          fontSize: 16.8,
          border: "none",
          borderRadius: 999,
          padding: "13px 0",
          opacity: nextDisabled ? 0.4 : 1,
          cursor: nextDisabled ? "default" : "pointer",
        }}
      >
        {stage === 1 && (
          <>
            わかった、次へ
            <ArrowRightIcon />
          </>
        )}
        {stage === 2 && !revealed && "答えを確認する"}
        {stage === 2 && revealed && (
          <>
            次へ
            <ArrowRightIcon />
          </>
        )}
        {stage === 3 && (
          <>
            次へ
            <ArrowRightIcon />
          </>
        )}
        {stage === 4 && (isLastWord ? "覚えた！結果を見る" : "覚えた！次の単語へ")}
      </button>
    </main>
  );
}
