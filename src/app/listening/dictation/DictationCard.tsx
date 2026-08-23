"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { speak } from "@/lib/speech";

type Question = {
  id: number;
  hsk_level: number;
  text_zh: string;
  correct_answer: string;
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

export default function DictationCard({
  question,
  nextHref,
}: {
  question: Question;
  nextHref: string;
}) {
  const [input, setInput] = useState("");
  const [checked, setChecked] = useState(false);
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

  const isCorrect = input.trim() === question.correct_answer;

  function handlePlay() {
    speak(question.text_zh);
    setPlaying(true);
    window.setTimeout(() => setPlaying(false), 1500);
  }

  const underlineColor = !checked ? "var(--line)" : isCorrect ? "var(--match-green)" : "var(--miss-red)";

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 22,
        boxShadow: "0 6px 20px rgba(0,0,0,0.07)",
        padding: "22px 20px",
        textAlign: "center",
      }}
    >
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
          fontSize: 14,
          border: "none",
          borderRadius: 999,
          padding: "11px 24px",
          cursor: "pointer",
          marginBottom: 14,
        }}
      >
        <SpeakerWaveIcon />
        {playing ? "再生中..." : "音声を再生"}
      </button>
      {!supported && (
        <p style={{ marginBottom: 8, fontSize: 11, color: "var(--miss-red)" }}>
          このブラウザは音声読み上げに対応していません。
        </p>
      )}

      <p style={{ textAlign: "left", fontSize: 13, fontWeight: 700, color: "var(--ink)", marginBottom: 14 }}>
        聞き取った中国語を入力してください
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setChecked(true);
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setChecked(false);
          }}
          placeholder="簡体字で入力"
          style={{
            width: "100%",
            textAlign: "center",
            fontSize: 18,
            background: "transparent",
            border: "none",
            borderBottom: `2px solid ${underlineColor}`,
            padding: "8px 0",
            outline: "none",
          }}
        />
        <p style={{ fontSize: 10, color: "var(--ink-soft)", marginTop: 6, marginBottom: 16 }}>
          簡体字で入力してください
        </p>

        <button
          type="submit"
          disabled={!input.trim()}
          style={{
            width: "100%",
            background: "var(--grad)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            border: "none",
            borderRadius: 999,
            padding: "12px 0",
            opacity: input.trim() ? 1 : 0.4,
            cursor: input.trim() ? "pointer" : "default",
          }}
        >
          答え合わせ
        </button>
      </form>

      {checked && (
        <p
          style={{
            marginTop: 14,
            textAlign: "left",
            fontSize: 12,
            fontWeight: 700,
            color: isCorrect ? "var(--match-green)" : "var(--miss-red)",
          }}
        >
          {isCorrect ? "✓ 正解です！" : `✗ 不正解。正解は「${question.correct_answer}」でした。`}
        </p>
      )}

      {checked && (
        <Link
          href={nextHref}
          style={{
            display: "block",
            marginTop: 16,
            fontSize: 13,
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
  );
}
