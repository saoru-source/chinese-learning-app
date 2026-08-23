"use client";

import { useState } from "react";
import { useLevel } from "@/lib/level/LevelContext";
import {
  generateAiSentence,
  recordAiSentenceResult,
  type AiSentence,
  type QuizScope,
} from "@/lib/quiz/ai";

const SCOPE_OPTIONS: { key: QuizScope; label: string; description: string }[] = [
  { key: "word", label: "単語", description: "語彙・意味・ピンインを中心に出題" },
  { key: "grammar", label: "文法", description: "文法パターンの用法・穴埋めを中心に出題" },
  { key: "mix", label: "ミックス", description: "単語を中心に、バランスよく出題(デフォルト)" },
];

export default function AiQuizCard() {
  const { levelKey } = useLevel();
  const [scope, setScope] = useState<QuizScope | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentence, setSentence] = useState<AiSentence | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [recording, setRecording] = useState(false);

  async function handleGenerate(currentScope: QuizScope) {
    setLoading(true);
    setError(null);
    setSentence(null);
    setRevealed(false);

    const result = await generateAiSentence(currentScope, levelKey);
    if (result.ok) {
      setSentence(result.sentence);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }

  async function handleAnswer(correct: boolean) {
    if (!sentence) return;
    setRecording(true);
    await recordAiSentenceResult(sentence.usedWordIds, correct);
    setRecording(false);
    setSentence(null);
    setRevealed(false);
  }

  if (!scope) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-center text-sm text-ink-soft">
          出題範囲を選んでください(HSK{levelKey})
        </p>
        {SCOPE_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => {
              setScope(opt.key);
              void handleGenerate(opt.key);
            }}
            className="rounded border border-line bg-paper p-4 text-left"
          >
            <p className="font-bold text-ink">{opt.label}</p>
            <p className="text-xs text-ink-soft">{opt.description}</p>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded border border-line p-8 text-center">
      <div className="mb-4 flex items-center justify-between text-xs text-ink-soft">
        <span>
          出題範囲: {SCOPE_OPTIONS.find((o) => o.key === scope)?.label} · HSK{levelKey}
        </span>
        <button
          type="button"
          onClick={() => {
            setScope(null);
            setSentence(null);
            setError(null);
            setRevealed(false);
          }}
          className="underline"
        >
          範囲を変更
        </button>
      </div>

      {!sentence && (
        <button
          type="button"
          onClick={() => handleGenerate(scope)}
          disabled={loading}
          className="rounded bg-seal px-6 py-2 text-sm text-ink disabled:opacity-50"
        >
          {loading ? "AIが例文を作成中…" : "AIに例文を作ってもらう"}
        </button>
      )}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {sentence && (
        <>
          <p className="mb-6 text-3xl">{sentence.hanzi}</p>

          {!revealed ? (
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="rounded bg-seal px-6 py-2 text-sm text-ink"
            >
              答えを見る
            </button>
          ) : (
            <>
              <p className="mb-1 text-ink-soft">{sentence.pinyin}</p>
              <p className="mb-2 text-lg">{sentence.meaning_ja}</p>
              {sentence.explanation_ja && (
                <p className="mb-6 text-xs text-ink-soft">
                  {sentence.explanation_ja}
                </p>
              )}
              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  disabled={recording}
                  onClick={() => handleAnswer(false)}
                  className="rounded border border-red-300 px-6 py-2 text-sm text-red-600 disabled:opacity-50"
                >
                  できなかった
                </button>
                <button
                  type="button"
                  disabled={recording}
                  onClick={() => handleAnswer(true)}
                  className="rounded bg-green-600 px-6 py-2 text-sm text-white disabled:opacity-50"
                >
                  できた
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
