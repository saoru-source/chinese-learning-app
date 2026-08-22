"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Question = {
  id: number;
  hsk_level: number;
  text_zh: string;
  correct_answer: string;
};

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-CN";
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

export default function DictationCard({ question }: { question: Question }) {
  const [input, setInput] = useState("");
  const [checked, setChecked] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  const isCorrect = input.trim() === question.correct_answer;

  return (
    <div className="rounded border border-line p-8 text-center">
      <p className="mb-4 text-xs text-ink-soft">HSK{question.hsk_level}</p>

      <button
        type="button"
        onClick={() => speak(question.text_zh)}
        className="mb-2 rounded bg-seal px-6 py-2 text-sm text-ink"
      >
        🔊 音声を再生
      </button>
      {!supported && (
        <p className="mb-4 text-xs text-red-600">
          このブラウザは音声読み上げに対応していません。
        </p>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setChecked(true);
        }}
        className="mt-4 flex flex-col gap-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setChecked(false);
          }}
          placeholder="聞き取った中国語を入力"
          className="rounded border border-line px-3 py-2 text-center text-lg"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="rounded bg-seal px-6 py-2 text-sm text-ink disabled:opacity-50"
        >
          答え合わせ
        </button>
      </form>

      {checked && (
        <p className="mb-4 mt-4 text-sm text-ink-soft">
          {isCorrect
            ? "正解です！"
            : `不正解。正解は「${question.correct_answer}」`}
        </p>
      )}

      <div className="mt-4">
        <Link href="/listening/dictation" className="text-sm underline">
          次の問題へ
        </Link>
      </div>
    </div>
  );
}
