"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { speak } from "@/lib/speech";
import WordDetailCard from "@/components/WordDetailCard";
import type { ListeningWordDetail } from "@/lib/listening/wordDetail";

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
  wordDetail,
}: {
  question: Question;
  nextHref: string;
  wordDetail: ListeningWordDetail | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [input, setInput] = useState("");
  const [checked, setChecked] = useState(false);
  const [supported, setSupported] = useState(true);
  const [playing, setPlaying] = useState(false);

  function handleNext() {
    startTransition(() => {
      router.push(nextHref);
    });
  }

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
          marginBottom: 14,
        }}
      >
        <SpeakerWaveIcon />
        {playing ? "再生中..." : "音声を再生"}
      </button>
      {!supported && (
        <p style={{ marginBottom: 8, fontSize: 13.2, color: "var(--miss-red)" }}>
          このブラウザは音声読み上げに対応していません。
        </p>
      )}

      <p style={{ textAlign: "left", fontSize: 15.6, fontWeight: 700, color: "var(--ink)", marginBottom: 14 }}>
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
            fontSize: 21.6,
            background: "transparent",
            border: "none",
            borderBottom: `2px solid ${underlineColor}`,
            padding: "8px 0",
            outline: "none",
          }}
        />
        <p style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 6, marginBottom: 16 }}>
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
            fontSize: 16.8,
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
            fontSize: 14.4,
            fontWeight: 700,
            color: isCorrect ? "var(--match-green)" : "var(--miss-red)",
          }}
        >
          {isCorrect ? "✓ 正解です！" : `✗ 不正解。正解は「${question.correct_answer}」でした。`}
        </p>
      )}

      {checked && (
        <button
          type="button"
          onClick={handleNext}
          disabled={isPending}
          style={{
            display: "block",
            width: "100%",
            marginTop: 16,
            fontSize: 15.6,
            fontWeight: 700,
            color: "#fff",
            background: "var(--grad)",
            border: "none",
            borderRadius: 999,
            padding: "11px 0",
            opacity: isPending ? 0.6 : 1,
            cursor: isPending ? "default" : "pointer",
          }}
        >
          {isPending ? "読み込み中..." : "次の問題へ"}
        </button>
      )}
    </div>

    {checked && wordDetail && <WordDetailCard detail={wordDetail} />}
    </>
  );
}
