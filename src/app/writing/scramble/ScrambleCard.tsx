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

// correct_sentenceは句読点付きの完成文だが、words_shuffledには句読点が
// 含まれない(タップ対象は単語のみ)。正誤判定は句読点を除いた文字列同士を
// 比較することで行う。
const PUNCT_RE = /[，。！？：；、（）“”"'—…,.!?:;()\s]/g;
function stripPunct(s: string): string {
  return s.replace(PUNCT_RE, "");
}

export default function ScrambleCard({
  question,
  nextHref,
}: {
  question: Question;
  nextHref: string;
}) {
  const [bank, setBank] = useState<string[]>(question.words_shuffled);
  const [answer, setAnswer] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [attempt, setAttempt] = useState(1);
  const [showRetryNotice, setShowRetryNotice] = useState(false);

  const isCorrect = answer.join("") === stripPunct(question.correct_sentence);
  const allPlaced = bank.length === 0;

  function moveToAnswer(index: number) {
    if (checked || revealed) return;
    setShowRetryNotice(false);
    const word = bank[index];
    setBank((prev) => prev.filter((_, i) => i !== index));
    setAnswer((prev) => [...prev, word]);
  }

  function moveToBank(index: number) {
    if (checked || revealed) return;
    const word = answer[index];
    setAnswer((prev) => prev.filter((_, i) => i !== index));
    setBank((prev) => [...prev, word]);
  }

  function handleReset() {
    setBank(question.words_shuffled);
    setAnswer([]);
    setChecked(false);
  }

  function handleReveal() {
    setRevealed(true);
  }

  // 1回目が不正解の場合はもう1回だけ並べ直して再挑戦させる。2回目も
  // 不正解だった場合に初めて正解を表示する(「答えを見る」は試行回数に
  // 関わらずいつでも即座に正解を表示する、既存仕様のまま)。
  function handleCheck() {
    if (isCorrect) {
      setChecked(true);
      return;
    }
    if (attempt === 1) {
      setAttempt(2);
      setBank(question.words_shuffled);
      setAnswer([]);
      setShowRetryNotice(true);
      return;
    }
    setChecked(true);
  }

  const showResult = checked || revealed;

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
          fontSize: 12,
          fontWeight: 700,
          borderRadius: 20,
          padding: "3px 12px",
          marginBottom: 18,
        }}
      >
        HSK{question.hsk_level}
      </span>

      {showRetryNotice && (
        <p style={{ fontSize: 13.2, fontWeight: 700, color: "var(--miss-red)", marginBottom: 12 }}>
          1回目は不正解でした。もう一度挑戦してください
        </p>
      )}

      {/* 回答欄: タップした単語をこの順番に並べていく。空の間はヒント文言を表示する。 */}
      <div
        style={{
          minHeight: 52,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          borderBottom: "2px solid var(--line)",
          paddingBottom: 14,
          marginBottom: 18,
        }}
      >
        {answer.length === 0 && !showResult && (
          <span style={{ fontSize: 13.2, color: "var(--ink-soft)" }}>
            下の単語をタップして、ここに文を組み立ててください
          </span>
        )}
        {answer.map((w, i) => (
          <button
            key={i}
            type="button"
            onClick={() => moveToBank(i)}
            disabled={showResult}
            style={{
              background: showResult
                ? isCorrect
                  ? "var(--match-green)"
                  : "color-mix(in srgb, var(--miss-red) 15%, var(--card))"
                : "var(--grad)",
              color: showResult ? (isCorrect ? "#fff" : "var(--miss-red)") : "#fff",
              border: "none",
              borderRadius: 12,
              padding: "9px 14px",
              fontSize: 20.4,
              cursor: showResult ? "default" : "pointer",
            }}
          >
            {w}
          </button>
        ))}
      </div>

      {/* 単語バンク: まだ並べていない残りの単語。タップすると回答欄の末尾に追加される。 */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, marginBottom: 22 }}>
        {bank.map((w, i) => (
          <button
            key={i}
            type="button"
            onClick={() => moveToAnswer(i)}
            disabled={showResult}
            style={{
              background: "var(--paper-deep)",
              border: "1px solid var(--line)",
              borderRadius: 12,
              padding: "9px 14px",
              fontSize: 20.4,
              color: "var(--ink)",
              cursor: showResult ? "default" : "pointer",
            }}
          >
            {w}
          </button>
        ))}
      </div>

      {!showResult ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={handleReset}
              disabled={answer.length === 0}
              style={{
                background: "var(--card)",
                border: "1px solid var(--line)",
                color: "var(--ink)",
                fontWeight: 700,
                fontSize: 15.6,
                borderRadius: 999,
                padding: "12px 24px",
                opacity: answer.length === 0 ? 0.4 : 1,
                cursor: answer.length === 0 ? "default" : "pointer",
              }}
            >
              やり直す
            </button>
            <button
              type="button"
              onClick={handleCheck}
              disabled={!allPlaced}
              style={{
                background: "var(--grad)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 15.6,
                border: "none",
                borderRadius: 999,
                padding: "12px 24px",
                opacity: allPlaced ? 1 : 0.4,
                cursor: allPlaced ? "pointer" : "default",
              }}
            >
              答え合わせ
            </button>
          </div>
          <button
            type="button"
            onClick={handleReveal}
            style={{
              background: "none",
              border: "none",
              color: "var(--ink-soft)",
              fontSize: 13.2,
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            わからないので答えを見る
          </button>
        </div>
      ) : (
        <>
          <p
            style={{
              fontSize: 14.4,
              fontWeight: 700,
              color: !revealed ? (isCorrect ? "var(--match-green)" : "var(--miss-red)") : "var(--ink-soft)",
              marginBottom: 10,
            }}
          >
            {!revealed && (isCorrect ? "✓ 正解です！" : "✗ 惜しい、正解は下の文でした。")}
          </p>
          <p style={{ fontSize: 21.6, color: "var(--ink)", marginBottom: 6 }}>{question.correct_sentence}</p>
          {question.meaning_ja && (
            <p style={{ fontSize: 15.6, color: "var(--ink-soft)", marginBottom: 20 }}>{question.meaning_ja}</p>
          )}
          <Link
            href={nextHref}
            style={{
              display: "inline-block",
              background: "var(--grad)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 16.8,
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
