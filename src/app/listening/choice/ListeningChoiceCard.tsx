"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { speak } from "@/lib/speech";
import WordDetailCard from "@/components/WordDetailCard";
import type { ListeningWordDetail } from "@/lib/listening/wordDetail";

type Question = {
  id: number;
  hsk_level: number;
  text_zh: string;
  correct_answer: string;
  choices: string[];
};

function SpeakerWaveIcon() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 9v6h4l5 5V4L8 9H4z" />
      <path d="M16 8.5a5 5 0 0 1 0 7" />
      <path d="M19 6a9 9 0 0 1 0 12" />
    </svg>
  );
}

export default function ListeningChoiceCard({
  question,
  nextHref,
  wordDetail,
}: {
  question: Question;
  nextHref: string;
  wordDetail: ListeningWordDetail | null;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);
  const [playing, setPlaying] = useState(false);

  // ブラウザAPI(window.speechSynthesis)の有無を見るための正当なuseEffect。
  // 初期値をuseStateの遅延初期化でtypeof window判定すると、SSR(false)と
  // クライアント初回描画(true)がずれてハイドレーションエラーになるため、
  // サーバーと同じ初期値(true)でレンダーしてからeffectで補正する必要がある。
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  function handlePlay() {
    speak(question.text_zh);
    setPlaying(true);
    window.setTimeout(() => setPlaying(false), 1500);
  }

  return (
    <>
    <div
      style={{
        background: "var(--card)",
        borderRadius: 22,
        boxShadow: "0 6px 20px rgba(0,0,0,0.07)",
        padding: "22px 20px",
        textAlign: "center",
      }}
    >
      <p style={{ fontSize: 14.4, color: "var(--ink-soft)", marginBottom: 14 }}>音声を聞いて、質問に答えてください</p>

      <button
        type="button"
        onClick={handlePlay}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: "var(--grad)",
          color: "#fff",
          fontWeight: 700,
          fontSize: 16.8,
          border: "none",
          borderRadius: 999,
          padding: "11px 24px",
          cursor: "pointer",
        }}
      >
        <SpeakerWaveIcon />
        {playing ? "再生中..." : "音声を再生"}
      </button>
      {!supported && (
        <p style={{ marginTop: 8, fontSize: 13.2, color: "var(--miss-red)" }}>
          このブラウザは音声読み上げに対応していません。
        </p>
      )}

      <p style={{ marginTop: 20, marginBottom: 12, textAlign: "left", fontSize: 15.6, fontWeight: 700, color: "var(--ink)" }}>
        HSK{question.hsk_level}レベルの内容を聞き取ってください
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {question.choices.map((c) => {
          const showResult = selected !== null;
          const isCorrect = c === question.correct_answer;
          const isSelected = c === selected;

          const background = showResult && isCorrect
            ? "var(--match-green)"
            : showResult && isSelected
              ? "color-mix(in srgb, var(--miss-red) 15%, var(--card))"
              : "var(--card)";
          const color = showResult && isCorrect ? "#fff" : showResult && isSelected ? "var(--miss-red)" : "var(--ink)";

          return (
            <button
              key={c}
              type="button"
              disabled={showResult}
              onClick={() => setSelected(c)}
              style={{
                borderRadius: 13,
                padding: "12px 10px",
                fontSize: 19.2,
                background,
                color,
                border: "none",
                boxShadow: "0 3px 10px rgba(0,0,0,0.06)",
                cursor: showResult ? "default" : "pointer",
              }}
            >
              {c}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <p
          style={{
            marginTop: 14,
            textAlign: "left",
            fontSize: 14.4,
            fontWeight: 700,
            color: selected === question.correct_answer ? "var(--match-green)" : "var(--miss-red)",
          }}
        >
          {selected === question.correct_answer
            ? `✓ 正解！「${question.correct_answer}」が音声に含まれていました。`
            : `✗ 不正解。正解は「${question.correct_answer}」でした。`}
        </p>
      )}

      {selected !== null && (
        <Link
          href={nextHref}
          style={{
            display: "block",
            marginTop: 16,
            fontSize: 15.6,
            fontWeight: 700,
            color: "#fff",
            background: "var(--grad)",
            borderRadius: 999,
            padding: "11px 0",
            textDecoration: "none",
          }}
        >
          次の問題へ
        </Link>
      )}
    </div>

    {selected !== null && wordDetail && <WordDetailCard detail={wordDetail} />}
    </>
  );
}
