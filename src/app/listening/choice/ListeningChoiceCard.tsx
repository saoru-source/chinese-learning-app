"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Question = {
  id: number;
  hsk_level: number;
  text_zh: string;
  correct_answer: string;
  choices: string[];
};

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-CN";
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

export default function ListeningChoiceCard({ question }: { question: Question }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

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

      <div className="mb-6 mt-4 flex flex-col gap-2">
        {question.choices.map((c) => {
          const showResult = selected !== null;
          const isCorrect = c === question.correct_answer;
          const isSelected = c === selected;
          return (
            <button
              key={c}
              type="button"
              disabled={showResult}
              onClick={() => setSelected(c)}
              className={`rounded border px-4 py-2 text-sm ${
                showResult && isCorrect
                  ? "border-jade bg-jade/20"
                  : showResult && isSelected
                    ? "border-red-400 bg-red-50"
                    : "border-line"
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <p className="mb-4 text-sm text-ink-soft">
          {selected === question.correct_answer
            ? "正解です！"
            : `不正解。正解は「${question.correct_answer}」`}
        </p>
      )}

      <Link href="/listening/choice" className="text-sm underline">
        次の問題へ
      </Link>
    </div>
  );
}
